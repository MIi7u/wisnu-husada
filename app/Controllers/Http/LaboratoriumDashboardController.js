'use strict'

/**
 * LaboratoriumDashboardController
 * ---------------------------------------------------------------
 * Halaman-halaman baru Modul Laboratorium (struktur menu 1-6):
 *   1. Dashboard / Beranda (statistik, hasil kritis, peringatan ARIMA)
 *   2. Permintaan & Pendaftaran (Requisition)
 *   3. Proses Pemeriksaan (Workflow: antrian, input hasil, validasi, cetak)
 *   4. Manajemen Stok & Reagen (master reagen, transaksi, prediksi ARIMA)
 *   5. Laporan & Analitik
 *   6. Pengaturan (master jenis pemeriksaan — reuse halaman existing)
 *
 * Tidak mengubah controller/rute integrasi yang sudah ada
 * (LaboratoriumController utk master & tarif).
 */

const Database = use('Database')

class LaboratoriumDashboardController {

    async _render({ view, session }, page, extra = {}) {
        const Env = use('Env')
        return view.render(page, Object.assign({
            user: session.get('session_nama'),
            level: session.get('session_level'),
            title: Env.get('APP_NAME'),
            label_menu: 'Laboratorium'
        }, extra))
    }

    /* ================= 1. Dashboard ================= */

    async dashboard(ctx) {
        let stats = { hariIni: 0, selesai: 0, tertunda: 0 }
        let kritis = []
        let peringatanStok = []
        try {
            const today = new Date().toISOString().slice(0, 10)
            stats.hariIni = await Database.from('lab_permintaan')
                .where('tanggal_permintaan', 'like', `${today}%`).count('id as total').first()
            stats.selesai = await Database.from('lab_permintaan')
                .where('status', 'SELESAI').count('id as total').first()
            stats.tertunda = await Database.from('lab_permintaan')
                .whereNotIn('status', ['SELESAI', 'DIBATALKAN']).count('id as total').first()
            kritis = await Database.from('lab_hasil as h')
                .leftJoin('lab_permintaan as p', 'p.id', 'h.id_permintaan')
                .where('h.kritis', true)
                .select('h.*', 'p.no_permintaan', 'p.nama_pasien', 'p.status as status_permintaan')
                .orderBy('h.id', 'desc').limit(10)
            peringatanStok = await Database.from('lab_reagen')
                .whereRaw('stok <= safety_stock AND aktif = ?', [true])
                .select('kode_reagen', 'nama_reagen', 'stok', 'safety_stock', 'satuan')
        } catch (e) { /* DB belum tersedia → tampilkan 0 */ }

        return this._render(ctx, 'admin.laboratorium.dashboard', {
            stats: {
                hariIni: (stats.hariIni && stats.hariIni.total) || 0,
                selesai: (stats.selesai && stats.selesai.total) || 0,
                tertunda: (stats.tertunda && stats.tertunda.total) || 0
            },
            kritis: kritis.map(k => ({
                no_permintaan: k.no_permintaan, nama_pasien: k.nama_pasien,
                nama_item: k.nama_item, hasil_nilai: k.hasil_nilai,
                nilai_normal: k.nilai_normal, status: k.status_permintaan
            })),
            peringatanStok
        })
    }

    /* ================= 2. Permintaan & Pendaftaran ================= */

    async permintaan(ctx) {
        return this._render(ctx, 'admin.laboratorium.permintaan')
    }

    async permintaanData({ request, response }) {
        try {
            let q = Database.from('lab_permintaan as p')
                .leftJoin('lab_jenis_pemeriksaan as jp', 'jp.kode_jenis', 'p.kode_jenis')
                .select('p.*', 'jp.nama_pemeriksaan')
                .orderBy('p.id', 'desc')
            if (request.input('status')) q = q.where('p.status', request.input('status'))
            const data = await q
            return response.json({ data })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async permintaanStore({ request, response, session }) {
        try {
            const data = request.only([
                'no_rm', 'nama_pasien', 'asal_ruangan', 'dokter_pengirim', 'kode_jenis'
            ])
            const now = new Date()
            const no = 'LAB' + now.toISOString().slice(0, 10).replace(/-/g, '') +
                String(Math.floor(1000 + Math.random() * 9000))
            await Database.table('lab_permintaan').insert(Object.assign(data, {
                no_permintaan: no,
                status: 'MENUNGGU SAMPEL',
                tanggal_permintaan: now,
                petugas: session.get('session_nama') || 'Sistem'
            }))
            return response.json({ success: true, no_permintaan: no })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async permintaanUpdateStatus({ params, request, response }) {
        try {
            await Database.table('lab_permintaan')
                .where('id', params.id)
                .update({ status: request.input('status') })
            return response.json({ success: true })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async permintaanDelete({ params, response }) {
        try {
            await Database.transaction(async trx => {
                await trx.table('lab_hasil').where('id_permintaan', params.id).delete()
                await trx.table('lab_permintaan').where('id', params.id).delete()
            })
            return response.json({ success: true })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    /* ================= 3. Proses Pemeriksaan ================= */

    async pemeriksaan(ctx) {
        return this._render(ctx, 'admin.laboratorium.pemeriksaan')
    }

    async antrianData({ response }) {
        try {
            const data = await Database.from('lab_permintaan as p')
                .leftJoin('lab_jenis_pemeriksaan as jp', 'jp.kode_jenis', 'p.kode_jenis')
                .select('p.*', 'jp.nama_pemeriksaan')
                .whereIn('p.status', ['SAMPEL DITERIMA', 'SEDANG DIPERIKSA', 'MENUNGGU VALIDASI'])
                .orderBy('p.id', 'asc')
            return response.json({ data })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    /** Daftar item (parameter) dari suatu jenis pemeriksaan untuk form input hasil */
    async itemsByJenis({ params, response }) {
        try {
            const data = await Database.table('lab_item')
                .where('kode_jenis', params.kode_jenis)
                .orderBy('urutan', 'asc')
            return response.json({ data })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async hasilSimpan({ params, request, response }) {
        try {
            const items = request.only(['items']) // array {kode_item,nama_item,hasil_nilai,satuan,nilai_normal,kritis}
            await Database.transaction(async trx => {
                await trx.table('lab_hasil').where('id_permintaan', params.id).delete()
                for (const it of (items || [])) {
                    await trx.table('lab_hasil').insert({
                        id_permintaan: params.id,
                        kode_item: it.kode_item,
                        nama_item: it.nama_item,
                        hasil_nilai: it.hasil_nilai,
                        satuan: it.satuan,
                        nilai_normal: it.nilai_normal,
                        kritis: !!it.kritis
                    })
                }
                await trx.table('lab_permintaan').where('id', params.id)
                    .update({ status: 'MENUNGGU VALIDASI' })
            })
            return response.json({ success: true })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async hasilList({ params, response }) {
        try {
            const data = await Database.table('lab_hasil')
                .where('id_permintaan', params.id)
            return response.json({ data })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async validasi({ params, request, response }) {
        try {
            const setujui = request.input('setujui', 'true') === 'true'
            await Database.table('lab_permintaan').where('id', params.id)
                .update({ status: setujui ? 'SELESAI' : 'SEDANG DIPERIKSA' })
            return response.json({ success: true })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    /** Halaman cetak hasil lab (PDF via print browser) */
    async cetakHasil({ params, view }) {
        const Env = use('Env')
        let permintaan = {}
        let hasil = []
        try {
            permintaan = await Database.from('lab_permintaan as p')
                .leftJoin('lab_jenis_pemeriksaan as jp', 'jp.kode_jenis', 'p.kode_jenis')
                .where('p.id', params.id)
                .select('p.*', 'jp.nama_pemeriksaan').first()
            hasil = await Database.table('lab_hasil').where('id_permintaan', params.id)
        } catch (e) { /* ignore */ }
        return view.render('admin.laboratorium.cetak_hasil', {
            title: Env.get('APP_NAME'), permintaan, hasil
        })
    }

    /* ================= 4. Manajemen Stok & Reagen ================= */

    async stok(ctx) {
        return this._render(ctx, 'admin.laboratorium.stok')
    }

    async reagenData({ response }) {
        try {
            const data = await Database.table('lab_reagen').orderBy('nama_reagen', 'asc')
            return response.json({ data })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async reagenDropdown({ response }) {
        try {
            const data = await Database.table('lab_reagen')
                .where('aktif', true)
                .select('id', 'kode_reagen', 'nama_reagen', 'satuan')
            return response.json({ data })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async reagenStore({ request, response }) {
        try {
            const data = request.only([
                'kode_reagen', 'nama_reagen', 'satuan', 'stok', 'safety_stock', 'expired_date'
            ])
            data.aktif = true
            await Database.table('lab_reagen').insert(data)
            return response.json({ success: true })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async reagenUpdate({ params, request, response }) {
        try {
            const data = request.only([
                'kode_reagen', 'nama_reagen', 'satuan', 'safety_stock', 'expired_date', 'aktif'
            ])
            data.aktif = data.aktif === 'true' || data.aktif === true || data.aktif === 1
            await Database.table('lab_reagen').where('id', params.id).update(data)
            return response.json({ success: true })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async reagenDelete({ params, response }) {
        try {
            await Database.table('lab_reagen').where('id', params.id).delete()
            return response.json({ success: true })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async stokTransaksi({ request, response, session }) {
        try {
            const data = request.only(['id_reagen', 'tipe', 'jumlah', 'keterangan'])
            await Database.transaction(async trx => {
                await trx.table('lab_stok_transaksi').insert(Object.assign(data, {
                    tanggal_transaksi: new Date(),
                    petugas: session.get('session_nama') || 'Sistem'
                }))
                const delta = data.tipe === 'MASUK' ? Number(data.jumlah) : -Number(data.jumlah)
                await trx.raw(`UPDATE lab_reagen SET stok = stok + ? WHERE id = ?`, [delta, data.id_reagen])
            })
            return response.json({ success: true })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async stokRiwayat({ response }) {
        try {
            const data = await Database.from('lab_stok_transaksi as t')
                .leftJoin('lab_reagen as r', 'r.id', 't.id_reagen')
                .select('t.*', 'r.nama_reagen')
                .orderBy('t.id', 'desc').limit(200)
            return response.json({ data })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    /** Kebutuhan reagen per tes (BOM) */
    async kebutuhanData({ response }) {
        try {
            const data = await Database.from('lab_reagen_kebutuhan as k')
                .leftJoin('lab_reagen as r', 'r.id', 'k.id_reagen')
                .leftJoin('lab_jenis_pemeriksaan as jp', 'jp.kode_jenis', 'k.kode_jenis')
                .select('k.*', 'r.nama_reagen', 'r.satuan', 'jp.nama_pemeriksaan')
            return response.json({ data })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async kebutuhanStore({ request, response }) {
        try {
            const data = request.only(['kode_jenis', 'id_reagen', 'jumlah_per_tes'])
            await Database.table('lab_reagen_kebutuhan').insert(data)
            return response.json({ success: true })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async kebutuhanDelete({ params, response }) {
        try {
            await Database.table('lab_reagen_kebutuhan').where('id', params.id).delete()
            return response.json({ success: true })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    /**
     * Prediksi kebutuhan reagen.
     * Jika modul `app/Services/ArimaService` tersedia (skripsi), pakai model ARIMA;
     * fallback: moving-average sederhana agar sistem tetap jalan.
     */
    async prediksi({ request, response }) {
        try {
            const horizon = Number(request.input('horizon', 4))
            const history = await Database.from('lab_stok_transaksi')
                .where('tipe', 'KELUAR')
                .select('id_reagen', 'jumlah', 'tanggal_transaksi')
                .orderBy('tanggal_transaksi', 'asc')

            // agregasi pemakaian bulanan per reagen
            const byReagen = {}
            for (const h of history) {
                const bulan = String(h.tanggal_transaksi || '').slice(0, 7)
                if (!byReagen[h.id_reagen]) byReagen[h.id_reagen] = {}
                byReagen[h.id_reagen][bulan] = (byReagen[h.id_reagen][bulan] || 0) + Number(h.jumlah)
            }

            let ArimaService = null
            try { ArimaService = use('App/Services/ArimaService') } catch (e) { /* opsional */ }

            const reagens = await Database.table('lab_reagen').where('aktif', true)
                .select('id', 'kode_reagen', 'nama_reagen', 'satuan', 'stok', 'safety_stock')
            const hasil = []
            for (const r of reagens) {
                const series = Object.values(byReagen[r.id] || {})
                let prediksiNext = 0
                if (ArimaService && series.length >= 4) {
                    prediksiNext = ArimaService.forecast(series, horizon)
                } else if (series.length > 0) {
                    const avg = series.reduce((a, b) => a + b, 0) / series.length
                    prediksiNext = Math.round(avg * horizon)
                }
                hasil.push({
                    kode_reagen: r.kode_reagen,
                    nama_reagen: r.nama_reagen,
                    satuan: r.satuan,
                    stok: r.stok,
                    safety_stock: r.safety_stock,
                    prediksi_kebutuhan: prediksiNext,
                    rekomendasi_pesan: Math.max(0, prediksiNext - r.stok + r.safety_stock)
                })
            }
            return response.json({ data: hasil, metode: ArimaService ? 'ARIMA' : 'Moving Average (fallback)' })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    /** Laporan kedaluwarsa reagen (default 60 hari ke depan) */
    async kedaluwarsa({ request, response }) {
        try {
            const hari = Number(request.input('hari', 60))
            const batas = new Date(Date.now() + hari * 86400000).toISOString().slice(0, 10)
            const data = await Database.from('lab_reagen')
                .whereNotNull('expired_date')
                .where('expired_date', '<=', batas)
                .where('aktif', true)
                .select('kode_reagen', 'nama_reagen', 'satuan', 'stok', 'expired_date')
                .orderBy('expired_date', 'asc')
            return response.json({ data })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    /* ================= 5. Laporan & Analitik ================= */

    async laporan(ctx) {
        return this._render(ctx, 'admin.laboratorium.laporan')
    }

    async laporanVolume({ response }) {
        try {
            const data = await Database.from('lab_permintaan as p')
                .leftJoin('lab_jenis_pemeriksaan as jp', 'jp.kode_jenis', 'p.kode_jenis')
                .select('jp.nama_pemeriksaan as label')
                .count('p.id as jumlah')
                .groupBy('jp.nama_pemeriksaan')
                .orderBy('jumlah', 'desc')
            return response.json({ data })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async laporanEfisiensi({ response }) {
        try {
            const data = await Database.from('lab_stok_transaksi as t')
                .leftJoin('lab_reagen as r', 'r.id', 't.id_reagen')
                .where('t.tipe', 'KELUAR')
                .select('r.nama_reagen as label')
                .sum('t.jumlah as terpakai')
                .groupBy('r.nama_reagen')
            return response.json({ data })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async laporanPendapatan({ response }) {
        try {
            const data = await Database.from('lab_permintaan as p')
                .leftJoin('tarif_lab as tl', 'tl.kode_jenis', 'p.kode_jenis')
                .leftJoin('lab_jenis_pemeriksaan as jp', 'jp.kode_jenis', 'p.kode_jenis')
                .where('p.status', 'SELESAI')
                .select('jp.nama_pemeriksaan as label')
                .sum('tl.tarif as pendapatan')
                .count('p.id as jumlah')
                .groupBy('jp.nama_pemeriksaan')
                .orderBy('pendapatan', 'desc')
            return response.json({ data })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }
}

module.exports = LaboratoriumDashboardController

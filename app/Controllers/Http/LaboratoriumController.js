'use strict'

/**
 * LaboratoriumController
 * ---------------------------------------------------------------
 * Modul Laboratorium SIMRS Wisnuhusada.
 * Pola mengikuti RuangLayananController (Database query builder).
 *
 * Tabel yang dipakai:
 *  - lab_jenis_pemeriksaan : master jenis pemeriksaan (paket) lab
 *  - lab_item              : master item parameter pemeriksaan lab
 *  - tarif_lab             : tarif pemeriksaan per ruang layanan
 */

const Database = use('Database')

class LaboratoriumController {

    /* ================= Halaman ================= */

    async index({ view, session }) {
        const Env = use('Env')
        return view.render('admin.laboratorium', {
            user: session.get('session_nama'),
            level: session.get('session_level'),
            title: Env.get('APP_NAME'),
            label_menu: 'Laboratorium'
        })
    }

    /* ================= Master Jenis Pemeriksaan Lab ================= */

    async jenisData({ response }) {
        try {
            const data = await Database
                .from('lab_jenis_pemeriksaan as jp')
                .leftJoin('ruang_layanan as rl', 'rl.kode_ruang', 'jp.kode_ruang')
                .select('jp.*', 'rl.nama_ruang')
                .orderBy('jp.kode_jenis', 'asc')
            return response.json({ data })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async jenisDropdown({ response }) {
        try {
            const data = await Database
                .table('lab_jenis_pemeriksaan')
                .where('aktif', true)
                .select('kode_jenis', 'nama_pemeriksaan', 'satuan_harga')
                .orderBy('nama_pemeriksaan', 'asc')
            return response.json({ data })
        } catch (err) {
            return response.status(500).json({ error: err.message })
        }
    }

    async jenisStore({ request, response }) {
        const data = request.only([
            'kode_jenis', 'nama_pemeriksaan', 'kode_ruang',
            'satuan_harga', 'aktif'
        ])
        data.aktif = data.aktif === 'true' || data.aktif === true
        await Database.table('lab_jenis_pemeriksaan').insert(data)
        return response.json({ success: true })
    }

    async jenisUpdate({ params, request, response }) {
        const data = request.only([
            'kode_jenis', 'nama_pemeriksaan', 'kode_ruang',
            'satuan_harga', 'aktif'
        ])
        data.aktif = data.aktif === 'true' || data.aktif === true
        await Database.table('lab_jenis_pemeriksaan')
            .where('id', params.id).update(data)
        return response.json({ success: true })
    }

    async jenisDelete({ params, response }) {
        await Database.table('lab_jenis_pemeriksaan')
            .where('id', params.id).delete()
        return response.json({ success: true })
    }

    /* ================= Master Item Pemeriksaan Lab ================= */

    async itemData({ request, response }) {
        const kodeJenis = request.input('kode_jenis', null)
        let q = Database
            .from('lab_item as li')
            .leftJoin('lab_jenis_pemeriksaan as jp', 'jp.kode_jenis', 'li.kode_jenis')
            .select('li.*', 'jp.nama_pemeriksaan as nama_jenis')
            .orderBy('li.kode_item', 'asc')
        if (kodeJenis) q = q.where('li.kode_jenis', kodeJenis)
        const data = await q
        return response.json({ data })
    }

    async itemStore({ request, response }) {
        const data = request.only([
            'kode_item', 'nama_item', 'kode_jenis',
            'satuan', 'harga', 'urutan'
        ])
        await Database.table('lab_item').insert(data)
        return response.json({ success: true })
    }

    async itemUpdate({ params, request, response }) {
        const data = request.only([
            'kode_item', 'nama_item', 'kode_jenis',
            'satuan', 'harga', 'urutan'
        ])
        await Database.table('lab_item')
            .where('id', params.id).update(data)
        return response.json({ success: true })
    }

    async itemDelete({ params, response }) {
        await Database.table('lab_item')
            .where('id', params.id).delete()
        return response.json({ success: true })
    }

    /* ================= Tarif Lab per Ruang ================= */

    async tarifData({ response }) {
        const data = await Database
            .from('tarif_lab as t')
            .leftJoin('ruang_layanan as rl', 'rl.kode_ruang', 't.kode_ruang')
            .leftJoin('lab_jenis_pemeriksaan as jp', 'jp.kode_jenis', 't.kode_jenis')
            .select('t.*', 'rl.nama_ruang', 'jp.nama_pemeriksaan')
            .orderBy('t.id', 'asc')
        return response.json({ data })
    }

    async tarifStore({ request, response }) {
        const data = request.only(['kode_ruang', 'kode_jenis', 'tarif'])
        await Database.table('tarif_lab').insert(data)
        return response.json({ success: true })
    }

    async tarifUpdate({ params, request, response }) {
        const data = request.only(['kode_ruang', 'kode_jenis', 'tarif'])
        await Database.table('tarif_lab')
            .where('id', params.id).update(data)
        return response.json({ success: true })
    }

    async tarifDelete({ params, response }) {
        await Database.table('tarif_lab')
            .where('id', params.id).delete()
        return response.json({ success: true })
    }
}

module.exports = LaboratoriumController

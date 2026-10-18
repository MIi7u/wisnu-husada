'use strict'

const Database = use('Database')
const Dokter = use('App/Models/Dokter')
const Helpers = use('Helpers')

class DokterController {
  // Halaman utama dokter
  async index({ view }) {
    return view.render('admin.dokter') // Pastikan path sesuai file
  }

  // List dokter untuk DataTables
  async data({ response }) {
    const data = await Database
      .select(
        'dokter.nip_dokter',
        'dokter.nm_dokter',
        'dokter.jenis_kelamin', 
        'dokter.kd_spesialis',
        'spesialis.nm_spesialis',
        'dokter.alamat',
        'dokter.no_telp',
        'dokter.tgl_masuk',
        'dokter.foto',
        'dokter.keterangan'
      )
      .from('dokter')
      .leftJoin('spesialis', 'dokter.kd_spesialis', 'spesialis.kd_spesialis')

    return response.json({ data })
  }


  // Simpan data baru
async store({ request, response }) {
  
    // Ambil semua field teks dari form (multipart-safe)
    const {nip_dokter, nm_dokter, jenis_kelamin, kd_spesialis, alamat, no_telp, 
           tgl_masuk, keterangan} = request.only(['nip_dokter', 'nm_dokter', 'jenis_kelamin', 'kd_spesialis',
            'alamat','no_telp', 'tgl_masuk', 'keterangan'])

    // --- VALIDASI SEDERHANA ---
    if (!nip_dokter || !nm_dokter || !jenis_kelamin) {
      return response.status(400).json({
        success: false,
        message: 'NIP, nama dokter, dan jenis kelamin wajib diisi'
      })
    }

    // Validasi jenis kelamin
    if (jenis_kelamin !== 'Laki-laki' && jenis_kelamin !== 'Perempuan') {
      return response.status(400).json({
        success: false,
        message: 'Jenis kelamin harus L atau P'
      })
    }

    // --- HANDLE FOTO ---
    const fotoFile = request.file('foto', { types: ['image'], size: '2mb' })
    let foto = null
    if (fotoFile) {
      const fotoName = `${Date.now()}.${fotoFile.extname}`
      await fotoFile.move(Helpers.publicPath('images'), { name: fotoName, overwrite: true })
      if (!fotoFile.moved()) throw fotoFile.error()
      foto = fotoName
    }
try {
    // --- INSERT KE DATABASE ---
  await Database.table('dokter').insert({
     nip_dokter,
      nm_dokter,
      jenis_kelamin,
      kd_spesialis,
      alamat,
      no_telp,
      tgl_masuk,
      keterangan,
      foto
  })

    return response.json({
      success: true,
      message: 'Data dokter berhasil disimpan'
    })

  } catch (error) {
    console.error('Error inserting dokter:', error)
    return response.status(500).json({
      success: false,
      message: `Gagal menyimpan data: ${error.message}`
    })
  }
}

  // Update data dokter
async update({ params, request, response }) {
    
      // Ambil field dari request
      const {nip_dokter, nm_dokter, jenis_kelamin, kd_spesialis, alamat, no_telp, 
           tgl_masuk, keterangan} = request.only(['nip_dokter', 'nm_dokter', 'jenis_kelamin', 'kd_spesialis',
            'alamat','no_telp', 'tgl_masuk', 'keterangan'])


      // --- VALIDASI JENIS KELAMIN ---
      if (jenis_kelamin !== 'Laki-laki' && jenis_kelamin !== 'Perempuan') {
      return response.status(400).json({
        success: false,
        message: 'Jenis kelamin harus L atau P'
      })
    }

      // --- HANDLE FOTO ---
    const fotoFile = request.file('foto', { types: ['image'], size: '2mb' })
    let foto = null
    if (fotoFile) {
      const fotoName = `${Date.now()}.${fotoFile.extname}`
      await fotoFile.move(Helpers.publicPath('images'), { name: fotoName, overwrite: true })
      if (!fotoFile.moved()) throw fotoFile.error()
      foto = fotoName
    }
try {
      // --- UPDATE DATABASE ---
      const updated = await Database.table('dokter')
        .where('nip_dokter', params.id)
        .update({nip_dokter,
          nm_dokter,
          jenis_kelamin,
          kd_spesialis,
          alamat,
          no_telp,
          tgl_masuk,
          keterangan,
          foto})
        if (updated) {
          return response.json({ message: 'Data berhasil diupdate' })
        } else {
          return response.status(404).json({ message: 'Data tidak ditemukan' })
        }
      

    } catch (error) {
      return response.status(500).json({
        success: false,
        message: `Terjadi kesalahan: ${error.message}`
        })
      }
  }
  // Hapus data dokter
  async destroy({ params, response }) {
    await Database.table('dokter').where('nip_dokter', params.id).delete()
    return response.json({ success: true })
  }
}

module.exports = DokterController

'use strict'

const Database = use('Database')

class SpesialisController {
  // ✅ Tampilkan halaman
  async index({ view }) {
    return view.render('admin.spesialis')
  }

  async list({ response }) {
    try {
      const data = await Database.table('spesialis').select('*').orderBy('kd_spesialis', 'asc')
      return response.json({ data })  // ⬅️ DataTables butuh property `data`
    } catch (error) {
      return response.status(500).json({
        message: 'Gagal ambil data spesialis dari list',
        error: error.message
      })
    }
  }


  async dropdown({ response }) {
    const spesialis = await Database.from('spesialis').select('kd_spesialis', 'nm_spesialis');
    return response.json(spesialis); // Langsung array
  }
  
  // 🟢 Simpan data baru
  async store({ request, response }) {
    const { kd_spesialis, nm_spesialis, keterangan } = request.only(['kd_spesialis', 'nm_spesialis', 'keterangan'])

    // Validasi sederhana (opsional)
    if (!kd_spesialis || !nm_spesialis) {
      return response.status(400).json({ message: 'Kode dan nama spesialis wajib diisi' })
    }

    try {
      await Database.table('spesialis').insert({
        kd_spesialis,
        nm_spesialis,
        keterangan
      })
      return response.json({ message: 'Data berhasil disimpan' })
    } catch (error) {
      console.error('Error inserting spesialis:', error)
      return response.status(500).json({ message: 'Gagal menyimpan data' })
    }
  }

  // 🔵 Update data
  async update({ request, params, response }) {
    const { kd_spesialis, nm_spesialis, keterangan } = request.only(['kd_spesialis', 'nm_spesialis', 'keterangan'])

    if (!kd_spesialis || !nm_spesialis) {
      return response.status(400).json({ message: 'Kode dan nama spesialis wajib diisi' })
    }

    try {
      const updated = await Database.table('spesialis')
        .where('kd_spesialis', params.id)
        .update({
          kd_spesialis,
          nm_spesialis,
          keterangan
        })

      if (updated) {
        return response.json({ message: 'Data berhasil diupdate' })
      } else {
        return response.status(404).json({ message: 'Data tidak ditemukan' })
      }
    } catch (error) {
      console.error('Error updating spesialis:', error)
      return response.status(500).json({ message: 'Gagal mengupdate data' })
    }
  }

  // 🔴 Hapus data
  async destroy({ params, response }) {
    try {
      const deleted = await Database.table('spesialis')
        .where('kd_spesialis', params.id)
        .delete()

      if (deleted) {
        return response.json({ message: 'Data berhasil dihapus' })
      } else {
        return response.status(404).json({ message: 'Data tidak ditemukan' })
      }
    } catch (error) {
      console.error('Error deleting spesialis:', error)
      return response.status(500).json({ message: 'Gagal menghapus data' })
    }
  }
}

module.exports = SpesialisController
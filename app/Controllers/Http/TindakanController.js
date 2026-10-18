'use strict'

const Tindakan = use('App/Models/Tindakan') // Pakai model, bukan Database

class TindakanController {
  // Halaman utama
  async index({ view }) {
    return view.render('admin.tindakan')
  }

  // Ambil semua data
  async data({ response }) {
    const tindakan = await Tindakan.all()
    return response.json({data: tindakan.toJSON()}) // Wajib bungkus pakai key "data"
  }
  

  // Tambah data
  async store({ request, response }) {
    try {
      const data = request.only(['kd_tindakan', 'nm_tindakan', 'detail', 'tarif', 'kd_acc', 'keterangan'])
      await Tindakan.create(data)
      return response.json({ success: true, message: 'Data berhasil ditambahkan' })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Gagal menambahkan data',
        error: error.message
      })
    }
  }

  // Update data
  async update({ params, request, response }) {
    try {
      const tindakan = await Tindakan.findOrFail(params.kd_tindakan)
      const data = request.only(['nm_tindakan', 'detail', 'tarif', 'kd_acc', 'keterangan'])
      tindakan.merge(data)
      await tindakan.save()
      return response.json({ success: true, message: 'Data berhasil diupdate' })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Gagal mengupdate data',
        error: error.message
      })
    }
  }

  // Hapus data
  async destroy({ params, response }) {
    try {
      const tindakan = await Tindakan.findOrFail(params.kd_tindakan)
      await tindakan.delete()
      return response.json({ success: true, message: 'Data berhasil dihapus' })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Gagal menghapus data',
        error: error.message
      })
    }
  }
}

module.exports = TindakanController

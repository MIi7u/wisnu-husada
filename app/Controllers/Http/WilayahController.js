'use strict'

const Database = use('Database')

class WilayahController {
  // Tampilkan halaman wilayah
  async index({ view }) {
    return view.render('admin.wilayah')
  }

  // Ambil data Provinsi (parent_code = 0)
  async getProvinsi() {
    return await Database
      .from('wilayah')
      .where('parent_code', 0)
      .orderBy('name', 'asc')
  }

  // Ambil data Kabupaten berdasarkan kode Provinsi
  async getKabupaten({ params }) {
    return await Database
      .from('wilayah')
      .where('parent_code', params.code)
      .orderBy('name', 'asc')
  }

  // Ambil data Kecamatan berdasarkan kode Kabupaten
  async getKecamatan({ params }) {
    return await Database
      .from('wilayah')
      .where('parent_code', params.code)
      .orderBy('name', 'asc')
  }

  // Ambil data Kelurahan berdasarkan kode Kecamatan
  async getKelurahan({ params }) {
    return await Database
      .from('wilayah')
      .where('parent_code', params.code)
      .orderBy('name', 'asc')
  }
}

module.exports = WilayahController

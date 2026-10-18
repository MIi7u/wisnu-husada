'use strict'

const Pasien = use('App/Models/Pasien')
const Database = use('Database')
const WilayahController = use('App/Controllers/Http/WilayahController') // Import WilayahController


class PasientController {
  // return view halaman (opsional)
  async index ({ view }) {
    return view.render('admin.pasien') // buat Edge view nanti
  }

  // DataTables AJAX source (mengembalikan semua data)
  async datatables ({ response }) {
    const rows = await Pasien.query().orderBy('created_at', 'desc').fetch()
    return response.json({ data: rows }) // DataTables expects {data: [...]}
  }

  // detail (dipanggil saat expand)
  async show ({ params, response }) {
    const patient = await Pasien.find(params.no_rm)
    if (!patient) {
      return response.status(404).json({ message: 'Pasien tidak ditemukan' })
    }
    return response.json(patient)
  }

  // store new
  async store ({ request, response }) {
    // simple validation (tambahan bisa disesuaikan)
    const rules = {
      no_rm: 'required',
      nama_lengkap: 'required'
    }

    const validation = await validate(request.all(), rules)
    if (validation.fails()) {
      return response.status(400).json({ errors: validation.messages() })
    }

    const payload = request.only([
      'no_rm','no_identitas','no_kk','nama_lengkap','jenis_kelamin','tempat_lahir',
      'tanggal_lahir','alamat','kode_pos','no_telepon','rt','rw','provinsi','kabupaten',
      'kecamatan','kelurahan','pendidikan','pekerjaan','golongan_darah','agama',
      'status_pernikahan','kewarganegaraan','no_rm_ibu','hubungan_pj','nama_pj'
    ])

    try {
      const patient = await Pasien.create(payload)
      return response.json({ message: 'Data pasien tersimpan', patient })
    } catch (err) {
      return response.status(500).json({ message: 'Gagal menyimpan', error: err.message })
    }
  }

  // update existing
  async update ({ params, request, response }) {
    const patient = await Pasien.find(params.no_rm)
    if (!patient) {
      return response.status(404).json({ message: 'Pasien tidak ditemukan' })
    }

    const payload = request.only([
      'no_identitas','no_kk','nama_lengkap','jenis_kelamin','tempat_lahir',
      'tanggal_lahir','alamat','kode_pos','no_telepon','rt','rw','provinsi','kabupaten',
      'kecamatan','kelurahan','pendidikan','pekerjaan','golongan_darah','agama',
      'status_pernikahan','kewarganegaraan','no_rm_ibu','hubungan_pj','nama_pj'
    ])

    try {
      patient.merge(payload)
      await patient.save()
      return response.json({ message: 'Data pasien diperbarui', patient })
    } catch (err) {
      return response.status(500).json({ message: 'Gagal memperbarui', error: err.message })
    }
  }

  // delete
  async destroy ({ params, response }) {
    const patient = await Pasien.find(params.no_rm)
    if (!patient) {
      return response.status(404).json({ message: 'Pasien tidak ditemukan' })
    }
    try {
      await patient.delete()
      return response.json({ message: 'Data pasien dihapus' })
    } catch (err) {
      return response.status(500).json({ message: 'Gagal menghapus', error: err.message })
    }
  }
}

module.exports = PasientController

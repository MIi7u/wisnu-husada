// app/Controllers/Http/PerawatController.js
'use strict'

const Database = use('Database')
const Helpers = use('Helpers')

class PerawatController {
  async index({ view }) {
    return view.render('admin.perawat')
  }

  async data({ response }) {
    const rows = await Database
      .from('perawat')
      .select(
        'nip_perawat','nama_perawat','jenis_kelamin','tgl_lahir',
        'no_hp','email','alamat','spesialis','tgl_mulai_kerja','status','foto'
      )
    return response.json({ data: rows })
  }

  async store({ request, response }) {
    try {
      const all = request.all()
      const payload = {
        nip_perawat: (all.nip_perawat || '').trim(),
        nama_perawat: (all.nama_perawat || '').trim(),
        jenis_kelamin: (all.jenis_kelamin || '').toUpperCase(), // 'L'/'P'
        tgl_lahir: all.tgl_lahir || null,
        no_hp: all.no_hp || null,
        email: all.email || null,
        alamat: all.alamat || null,
        spesialis: all.spesialis || null,
        tgl_mulai_kerja: all.tgl_mulai_kerja || null,
        status: all.status || 'Aktif'
      }

      // Validasi minimal
      if (!payload.nip_perawat || !payload.nama_perawat || !payload.jenis_kelamin || !payload.tgl_lahir || !payload.tgl_mulai_kerja) {
        return response.status(400).json({ success: false, message: 'Lengkapi field wajib!' })
      }
      if (!['Laki-laki','Perempuan'].includes(payload.jenis_kelamin)) {
        return response.status(400).json({ success: false, message: 'Jenis kelamin hanya L atau P' })
      }
      if (!['Aktif','Cuti','Nonaktif'].includes(payload.status)) {
        return response.status(400).json({ success: false, message: 'Status tidak valid' })
      }

      // Foto (opsional)
      const fotoFile = request.file('foto', { types: ['image'], size: '2mb' })
      if (fotoFile) {
        const fotoName = `${Date.now()}.${fotoFile.extname}`
        await fotoFile.move(Helpers.publicPath('images/perawat'), { name: fotoName, overwrite: true })
        if (!fotoFile.moved()) return response.status(400).json({ success: false, message: `Upload foto gagal: ${fotoFile.error()}` })
        payload.foto = `images/perawat/${fotoName}`
      } else {
        payload.foto = null
      }

      await Database.table('perawat').insert(payload)
      return response.json({ success: true, message: 'Perawat tersimpan' })
    } catch (error) {
      return response.status(500).json({ success: false, message: `Gagal simpan: ${error.message}` })
    }
  }

  async update({ params, request, response }) {
    try {
      const all = request.all()
      const payload = {
        nama_perawat: (all.nama_perawat || '').trim(),
        jenis_kelamin: (all.jenis_kelamin || '').toUpperCase(),
        tgl_lahir: all.tgl_lahir || null,
        no_hp: all.no_hp || null,
        email: all.email || null,
        alamat: all.alamat || null,
        spesialis: all.spesialis || null,
        tgl_mulai_kerja: all.tgl_mulai_kerja || null,
        status: all.status || 'Aktif',
        keterangan:all.keterangan
      }

      if (!payload.nama_perawat || !payload.jenis_kelamin || !payload.tgl_lahir || !payload.tgl_mulai_kerja) {
        return response.status(400).json({ success: false, message: 'Lengkapi field wajib!' })
      }
      if (!['L','P'].includes(payload.jenis_kelamin)) {
        return response.status(400).json({ success: false, message: 'Jenis kelamin hanya L atau P' })
      }
      if (!['Aktif','Cuti','Nonaktif'].includes(payload.status)) {
        return response.status(400).json({ success: false, message: 'Status tidak valid' })
      }

      // Foto (opsional)
      const fotoFile = request.file('foto', { types: ['image'], size: '2mb' })
      if (fotoFile) {
        const fotoName = `${Date.now()}.${fotoFile.extname}`
        await fotoFile.move(Helpers.publicPath('images'), { name: fotoName, overwrite: true })
        if (!fotoFile.moved()) return response.status(400).json({ success: false, message: `Upload foto gagal: ${fotoFile.error()}` })
        payload.foto = `images/${fotoName}`
      }

      const updated = await Database.table('perawat').where('nip_perawat', params.nip).update(payload)
      if (!updated) return response.status(404).json({ success: false, message: 'Perawat tidak ditemukan' })

      return response.json({ success: true, message: 'Perawat diperbarui' })
    } catch (error) {
      return response.status(500).json({ success: false, message: `Gagal update: ${error.message}` })
    }
  }

  async destroy({ params, response }) {
    try {
      const del = await Database.table('perawat').where('nip_perawat', params.nip).delete()
      if (!del) return response.status(404).json({ success: false, message: 'Perawat tidak ditemukan' })
      return response.json({ success: true, message: 'Perawat dihapus' })
    } catch (error) {
      return response.status(500).json({ success: false, message: `Gagal hapus: ${error.message}` })
    }
  }
}

module.exports = PerawatController

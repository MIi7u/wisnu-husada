'use strict'

const Helpers = use('Helpers')
const Database = use('Database')
class PegawaiController {
  // Halaman utama dokter
  async index({ view }) {
    const ruang = await Database
        .table('ruang_layanan')
        .orderBy('nama_ruang', 'asc')
    const pegawai = await Database
        .table('pegawai')
        .orderBy('nama_lengkap', 'asc')   
    return view.render('admin.pegawai',{ ruang,pegawai })
  }

  // DATA DATATABLES
  async data({ response }) {
    const pegawai = await Database
      .table('pegawai')
      .select('*')
    return response.json({
      data: pegawai
    })
  }
  async store({ request, response }) {

    const data = request.only([
        'nik',
        'nip',
        'ruang_kerja',
        'nama_lengkap',
        'gelar_depan',
        'gelar_belakang',
        'kategori_pegawai',
        'sip',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'provinsi',
        'kabupaten',
        'kecamatan',
        'desa',
        'alamat',
        'agama',
        'pendidikan_terakhir',
        'status_nikah',
        'golongan_darah',
        'nomor_hp',
        'email',
        'npwp',
        'status_keaktifan'

    ])

    const foto = request.file('pas_foto', {
        types:['image'],
        size:'5mb'
    })

    if(foto){

        const fileName =
            new Date().getTime() +
            '.' +
            foto.extname

        await foto.move(
            Helpers.publicPath('uploads'),
            {
                name:fileName
            }
        )

        data.pas_foto = fileName
    }

    await Database
    .table('pegawai')
    .insert(data)

    return response.json({
        success:true
    })
  }

  async update({ params, request, response }) {
    const data = request.only([
        'nik',
        'nip',
        'ruang_kerja',
        'nama_lengkap',
        'gelar_depan',
        'gelar_belakang',
        'kategori_pegawai',
        'sip',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'provinsi',
        'kabupaten',
        'kecamatan',
        'desa',
        'alamat',
        'agama',
        'pendidikan_terakhir',
        'status_nikah',
        'golongan_darah',
        'nomor_hp',
        'email',
        'npwp',
        'status_keaktifan'
    ])
    await Database
        .table('pegawai')
        .where('id', params.id)
        .update(data)
    return response.json({
        success:true
    })
    }
    async provinsi({ response }) {
    const data = await Database
        .table('wilayah')
        .where('level','PROVINSI')
    return response.json(data)
    }
    async kabupaten({ params, response }) {
    const data = await Database
        .table('wilayah')
        .where('parent_id', params.id)
    return response.json(data)
  }
  async search({ request, response }) {
    const term =
        request.input('term')
    const data = await Database
        .table('pegawai')
        .where('nama_lengkap','ilike',`%${term}%`)
        .limit(20)
    return response.json(
        data.map(item => ({
            id:item.id,
            text:item.nama_lengkap
        }))
    )
  }
}

module.exports = PegawaiController

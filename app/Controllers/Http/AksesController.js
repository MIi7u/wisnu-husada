'use strict'

const Database = use('Database')
class AksesController {
    async data({ response }) {
        const data = await Database
        .from('akses as a')
        .innerJoin(
            'pegawai as p',
            'p.nik',
            'a.nik'
        )
        .innerJoin(
            'ruang_layanan as r',
            'r.kode_ruang',
            'a.kode_ruang'
        )
        .select(
            'a.id',
            'p.nik',
            'p.nama_lengkap',
            'r.nama_ruang',
            'a.kode_ruang'
        )
        return response.json({
            data
        })
    }
    async store({ request, response }) {
        await Database
        .table('akses')
        .insert({
            nik:request.input('nik'),
            kode_ruang:request.input('kode_ruang')
        })
        return response.json({
            success:true
        })
    }
    async update({ params, request, response }) {
    await Database.table('akses')
    .where('id',params.id)
    .update({
        nik:request.input('nik'),
        kode_ruang:request.input('kode_ruang')
    })
    return response.json({
        success:true
    })
  }
    async delete({ params, response }) {
    await Database.table('akses')
    .where('id',params.id)
    .delete()
    return response.json({
        success:true
    })      
}
}
module.exports = AksesController
'use strict'

const Database = use('Database')
class RuangLayananController {

    async index({ view }) {
        return view.render('admin.ruang_layanan')
    }

    async data({ response }) {
        const data = await Database
            .table('ruang_layanan')
            .orderBy('id', 'asc')
        return response.json({
            data: data
        })
    }

    async store({ request, response }) {
        const data = request.only([
            'kode_ruang',
            'kode_bpjs',
            'nama_ruang',
            'instalasi_bidang',
            'kode_jenis_pelayanan'
        ])

        await Database
            .table('ruang_layanan')
            .insert(data)
        return response.json({
            success:true
        })
    }

    async update({ params, request, response }) {
        const data = request.only([
            'kode_ruang',
            'kode_bpjs',
            'nama_ruang',
            'instalasi_bidang',
            'kode_jenis_pelayanan'
        ])

        await Database
            .table('ruang_layanan')
            .where('id', params.id)
            .update(data)

        return response.json({
            success:true
        })
    }

    async delete({ params, response }) {
        await Database
            .table('ruang_layanan')
            .where('id', params.id)
            .delete()
        return response.json({
            success:true
        })
    }
}

module.exports = RuangLayananController
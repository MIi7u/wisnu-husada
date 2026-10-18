'use strict'

const Database = use('Database')

class RekeningController {

    async index({ view }) {

        return view.render('admin.rekening')

    }

    async data({ response }) {

        const data = await Database
            .table('rekening')
            .orderBy('kode_rek')

        return response.json({
            data
        })
    }

    async store({ request, response }) {

        await Database
            .table('rekening')
            .insert({

                kode_rek : request.input('kode_rek'),
                nama_rek : request.input('nama_rek')

            })

        return response.json({
            success:true
        })
    }

    async update({ request, response }) {

        await Database
            .table('rekening')
            .where(
                'kode_rek',
                request.input('kode_rek_lama')
            )
            .update({

                kode_rek : request.input('kode_rek'),
                nama_rek : request.input('nama_rek'),
                updated_at :
                Database.raw('CURRENT_TIMESTAMP')

            })

        return response.json({
            success:true
        })
    }

    async delete({ request, response }) {

        await Database
            .table('rekening')
            .where(
                'kode_rek',
                request.input('kode_rek')
            )
            .delete()

        return response.json({
            success:true
        })
    }

}

module.exports = RekeningController
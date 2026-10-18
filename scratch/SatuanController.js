'use strict'

const Database = use('Database')

class SatuanController {

    async index({ view }) {

        return view.render('admin.satuan')

    }

    async data({ response }) {

        const data = await Database
            .table('satuan')
            .orderBy('nama_satuan')

        return response.json({
            data
        })
    }

    async store({ request, response }) {

        await Database
            .table('satuan')
            .insert({

                nama_satuan:
                request.input('nama_satuan')

            })

        return response.json({
            success:true
        })
    }

    async update({ request, response }) {

        await Database
            .table('satuan')
            .where(
                'id',
                request.input('id')
            )
            .update({

                nama_satuan:
                request.input('nama_satuan'),

                updated_at:
                Database.raw('CURRENT_TIMESTAMP')

            })

        return response.json({
            success:true
        })
    }

    async delete({ request, response }) {

        await Database
            .table('satuan')
            .where(
                'id',
                request.input('id')
            )
            .delete()

        return response.json({
            success:true
        })
    }

}

module.exports = SatuanController
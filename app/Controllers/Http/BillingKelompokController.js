'use strict'

const Database = use('Database')

class BillingKelompokController {

    async index({ view }) {

        return view.render('admin.billing_kelompok')

    }

    async data({ response }) {

        const data = await Database
            .table('billing_kelompok')
            .orderBy('id', 'asc')

        return response.json({
            data
        })

    }

    async store({ request, response }) {

        await Database
            .table('billing_kelompok')
            .insert({
                nama_tarif_kelompok:
                    request.input('nama_tarif_kelompok'),

                kategori:
                    request.input('kategori')
            })

        return response.json({
            success:true
        })

    }

    async update({ params, request, response }) {

        await Database
            .table('billing_kelompok')
            .where('id', params.id)
            .update({

                nama_tarif_kelompok:
                    request.input('nama_tarif_kelompok'),

                kategori:
                    request.input('kategori'),

                updated_at:
                    Database.raw('CURRENT_TIMESTAMP')

            })

        return response.json({
            success:true
        })

    }

    async delete({ params, response }) {

        await Database
            .table('billing_kelompok')
            .where('id', params.id)
            .delete()

        return response.json({
            success:true
        })

    }

}

module.exports = BillingKelompokController
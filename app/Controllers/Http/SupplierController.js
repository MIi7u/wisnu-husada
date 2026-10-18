'use strict'

const Database = use('Database')

class SupplierController {

    async index({ view }) {

        return view.render('admin.supplier')

    }

    async data({ response }) {

        const data = await Database
            .table('supplier')
            .orderBy('nama_supplier')

        return response.json({
            data
        })
    }

    async store({ request, response }) {

        await Database
            .table('supplier')
            .insert({

                kode_supplier : request.input('kode_supplier'),
                nama_supplier : request.input('nama_supplier'),
                alamat : request.input('alamat'),
                telepon : request.input('telepon'),
                kota : request.input('kota'),
                npwp : request.input('npwp'),
                memo : request.input('memo'),
                tempo : request.input('tempo'),
                jenis : request.input('jenis'),
                status : request.input('status')

            })

        return response.json({
            success:true
        })
    }

    async update({ request, response }) {

        await Database
            .table('supplier')
            .where(
                'id',
                request.input('id')
            )
            .update({

                kode_supplier : request.input('kode_supplier'),
                nama_supplier : request.input('nama_supplier'),
                alamat : request.input('alamat'),
                telepon : request.input('telepon'),
                kota : request.input('kota'),
                npwp : request.input('npwp'),
                memo : request.input('memo'),
                tempo : request.input('tempo'),
                jenis : request.input('jenis'),
                status : request.input('status'),
                updated_at :
                Database.raw('CURRENT_TIMESTAMP')

            })

        return response.json({
            success:true
        })
    }

    async delete({ request, response }) {

        await Database
            .table('supplier')
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

module.exports = SupplierController
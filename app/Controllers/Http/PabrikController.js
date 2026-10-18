'use strict'
const Database = use('Database')
class PabrikController {
    async index({ view }) {
        const pabrik = await Database
            .select('*')
            .from('pabrik')
            .orderBy('nama_pabrik', 'asc')
        return view.render('admin.pabrik', {
            pabrik
        })
    }
    async data({ response }) {
    const data = await Database
        .table('pabrik')
        .orderBy('nama_pabrik')
    return response.json({data})

}
    async store({ request, response, session }) {
        const data = request.only([
            'kode_pabrik',
            'nama_pabrik',
            'alamat',
            'no_telp',
            'kota',
            'keterangan'
        ])
        await Database.table('pabrik')
            .insert(data)
        session.flash({
            success: 'Data berhasil disimpan'
        })
        return response.redirect('back')
    }

    async update({ request, response, session }) {
        const kode = request.input('kode_pabrik')
        await Database
            .table('pabrik')
            .where('kode_pabrik', kode)
            .update({
                nama_pabrik: request.input('nama_pabrik'),
                alamat: request.input('alamat'),
                no_telp: request.input('no_telp'),
                kota: request.input('kota'),
                keterangan: request.input('keterangan'),
                updated_at: Database.raw('CURRENT_TIMESTAMP')
            })
        session.flash({
            success: 'Data berhasil diupdate'
        })
        return response.redirect('back')
    }

    async delete({ request, response, session }) {
        await Database
            .table('pabrik')
            .where(
                'kode_pabrik',
                request.input('kode_pabrik')
            )
            .delete()
        session.flash({
            success: 'Data berhasil dihapus'
        })
        return response.redirect('back')
    }
}
module.exports = PabrikController
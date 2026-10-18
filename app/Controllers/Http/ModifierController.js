'use strict'
const Modifier = use('App/Models/Modifiers')

class ModifierController {
  async index({ view }) {
    return view.render('admin.modifiers')
  }

  async data() {
    const data = await Modifier.all()
    return response.json({ data })
  }

  async store({ request }) {
    const { Code, Kategori, Kelompok_Item } = request.all()
    await Modifier.create({ Code, Kategori, Kelompok_Item })
    return { success: true, message: 'Data berhasil ditambahkan' }
  }

  async update({ request, params }) {
    const modifier = await Modifier.find(params.code)
    modifier.merge(request.only(['Kategori', 'Kelompok_Item']))
    await modifier.save()
    return { success: true, message: 'Data berhasil diperbarui' }
  }

  async delete({ params }) {
    const modifier = await Modifier.find(params.code)
    await modifier.delete()
    return { success: true, message: 'Data berhasil dihapus' }
  }
}

module.exports = ModifierController

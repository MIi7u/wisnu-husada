'use strict'

const Basecode = use('App/Models/Basecode')
const Database = use('Database') // <--- ini wajib ditambahkan

class BasecodeController {
  async index({ view }) {
     // Ambil semua data dari tabel modifiers
    const modifiers = await Database.from('modifiers')
    return view.render('admin.basecode', { modifiers })
  }

  async data({ response }) {
    const basecode = await Basecode.all()
    return response.json({data: basecode.toJSON()})
  }
  
  async show({ params, response }) {
    const basecode = await Basecode.findOrFail(params.id)
    return response.json({ data: basecode })
   }

  async store({ request, response }) {
  const { kd_basecode, nm_basecode, allowed_modifiers } = request.all()

  const kategori = allowed_modifiers ? allowed_modifiers.split(',').map(x => x.trim()).join('|') : ''
  const item = allowed_modifiers ? allowed_modifiers.split(',').map(x => `Item-${x.trim()}`).join(', ') : ''
  const kptl = kd_basecode + '+' + allowed_modifiers

  await Basecode.create({
    kd_basecode,
    nm_basecode,
    allowed_modifiers,
    kategori_a_m: kategori,
    item_a_m: item,
    kptl
  })

  return response.json({ success: true })
}

    async update({ params, request, response }) {
    const basecode = await Basecode.findOrFail(params.id)
    const { kd_basecode, nm_basecode, allowed_modifiers } = request.all()

    const kategori = allowed_modifiers ? allowed_modifiers.split(',').map(x => x.trim()).join('|') : ''
    const item = allowed_modifiers ? allowed_modifiers.split(',').map(x => `Item-${x.trim()}`).join(', ') : ''
    const kptl = kd_basecode + '+' + allowed_modifiers

    basecode.merge({
        kd_basecode,
        nm_basecode,
        allowed_modifiers,
        kategori_a_m: kategori,
        item_a_m: item,
        kptl
    })
    }

  async destroy({ params, response }) {
    const basecode = await Basecode.findOrFail(params.id)
    await basecode.delete()
    return response.json({ success: true })
  }
  // 🔥 Tambahan method untuk list modifiers
  async list({ response }) {
    const modifiers = await Database.from('modifiers')
    return response.json({ data: modifiers })
  }
}

module.exports = BasecodeController

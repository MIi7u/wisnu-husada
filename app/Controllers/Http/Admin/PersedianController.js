'use strict'

const Admin    = use('App/Models/Admin')
const Function = use('App/Helper/Function')
const Env      = use('Env')
const Database = use('Database')
const fs       = use("fs")

class PersedianController {
  async index({ view, auth, session }) {
    try {
      const user     = session.get('session_nama')
      const level    = session.get('session_level')
      const username = session.get('session_username')

      return view.render('admin.persedian_menu', {
        user       : user,
        title      : Env.get('APP_NAME'),
        level      : level,
        label_menu : "Halaman Utama Persedian"
      })
    } catch (err) {
      return view.render('error_404', { error: err })
    }
  }

  async persedian_menu({ view, auth, session ,request,response}) {
    try {
      const user     = session.get('session_nama')
      const level    = session.get('session_level')
      const username = session.get('session_username')

      //response.send("ok")
      return view.render('admin.obat', {
        user       : user,
        title      : Env.get('APP_NAME'),
        level      : level,
        label_menu : "Halaman Utama Persedian"
      })
    } catch (err) {
      return view.render('error_404', { error: err })
    }
  }


}

// JANGAN GUNAKAN `export default`
module.exports = PersedianController

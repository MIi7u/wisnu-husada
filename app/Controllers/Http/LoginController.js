'use strict'

const Admin                  = use('App/Models/Admin')
const Function               = use('App/Helper/Function')
const Env                    = use('Env')
const Database               = use('Database')



const Hash = use('Hash')
const axios = use("axios");
class LoginController {
  async index({ view,request,response }) {
    let tgl = new Date()
    let hostname_arr = request.request.rawHeaders[1].split(':')
    let hostname     = Env.get('APP_NAME')
   
    return view.render('login',{ hostname : hostname
      
    })
  }   

  async check({ request, auth, session, response ,view}) {   
   var username = Function.verifi_hp(request.input("username"))
   try {
  
            
       }catch(err) {
        return view.render('error_404', { error: err })
       }
 
  }
  async logout({ auth, response,session }) {
    await session.clear()

    // Log out pengguna dari autentikasi
    await auth.logout()
    return response.route('login.index')
  }

}

module.exports = LoginController
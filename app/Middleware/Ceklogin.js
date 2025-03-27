'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class RedirectIfAuthenticated {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request, auth, response,session }, next) {
    // call next to advance the request
    if(session.get('session_id')){
      if(session.get('session_level')=="super"){
        return response.route('dashboard')
      }else if(session.get('session_level')=="pedagang"){
        return response.route('pedagang.dashboard')
      }
      
     }else{      
      await next()
     }
  }
}

module.exports = RedirectIfAuthenticated
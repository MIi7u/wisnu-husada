'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Authenticate {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ response, auth ,session}, next) {
    // call next to advance the request
    /*
    try {
      await auth.check()
    } catch (error) {
      return response.route('login.index')
    }
    */
     if(session.get('session_id')){
     	await next()
     }else{
     	return response.route('login.index')
     }

    
  }
}

module.exports = Authenticate
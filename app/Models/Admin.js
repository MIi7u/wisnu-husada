
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Admin extends Model {
	static get table () {
	  return 'm_admin'
	}
}

module.exports = Admin

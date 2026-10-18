'use strict'

const Model = use('Model')

class Modifier extends Model {
  static get primaryKey () {
    return 'Code' // pakai Code sebagai primary key
  }

  static get table () {
    return 'modifiers'
  }
}

module.exports = Modifier

'use strict'

const Model = use('Model')

class Pasien extends Model {
  static get primaryKey () {
    return 'no_rm'
  }

  static get incrementing () {
    return false
  }

  // jika ingin hidden/visible => atur di sini
}

module.exports = Pasien

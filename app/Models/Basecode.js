'use strict'

const Model = use('Model')

class Basecode extends Model {
static get table() {
    return 'tabel_basecode' // ganti dengan nama tabel di database
  }

  static get primaryKey() {
    return 'kd_basecode' // ganti sesuai primary key
  }
}
module.exports = Basecode

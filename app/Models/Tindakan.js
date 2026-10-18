'use strict'

const Model = use('Model')

class Tindakan extends Model {
  static get table() {
    return 'tindakan' // ganti dengan nama tabel di database
  }

  static get primaryKey() {
    return 'kd_tindakan' // ganti sesuai primary key
  }
}

module.exports = Tindakan

'use strict'

const Model = use('Model')

class Dokter extends Model {
  static get table () {
    return 'dokter'  // nama tabel
  }
  static get jenisKelaminOptions() {
    return ['L', 'P'];
  }

  spesialis() {
    return this.belongsTo('App/Models/Spesialis', 'kd_spesialis', 'kd_spesialis')
  }
}

module.exports = Dokter

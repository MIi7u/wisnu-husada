'use strict'

const Schema = use('Schema')

/**
 * Skema modul Laboratorium SIMRS Wisnuhusada.
 * Tabel dirujuk oleh LaboratoriumController dan terhubung ke
 * ruang_layanan (master existing) via kode_ruang.
 */
class LabSchema extends Schema {
  up () {
    this.schema.createTable('lab_jenis_pemeriksaan', table => {
      table.increments()
      table.string('kode_jenis', 20).notNullable().unique()
      table.string('nama_pemeriksaan', 150).notNullable()
      table.string('kode_ruang', 20).references('kode_ruang').inTable('ruang_layanan')
      table.enum('satuan_harga', ['Paket', 'Item']).defaultTo('Paket')
      table.boolean('aktif').defaultTo(true)
      table.timestamps()
    })

    this.schema.createTable('lab_item', table => {
      table.increments()
      table.string('kode_item', 20).notNullable().unique()
      table.string('nama_item', 150).notNullable()
      table.string('kode_jenis', 20).references('kode_jenis').inTable('lab_jenis_pemeriksaan')
      table.string('satuan', 30)
      table.decimal('harga', 14, 2).defaultTo(0)
      table.integer('urutan').defaultTo(0)
      table.timestamps()
    })

    this.schema.createTable('tarif_lab', table => {
      table.increments()
      table.string('kode_ruang', 20).references('kode_ruang').inTable('ruang_layanan')
      table.string('kode_jenis', 20).references('kode_jenis').inTable('lab_jenis_pemeriksaan')
      table.decimal('tarif', 14, 2).notNullable().defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.schema.dropTable('tarif_lab')
    this.schema.dropTable('lab_item')
    this.schema.dropTable('lab_jenis_pemeriksaan')
  }
}

module.exports = LabSchema

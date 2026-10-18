'use strict'

const Schema = use('Schema')

/**
 * Skema operasional modul Laboratorium SIMRS Wisnuhusada.
 * Menambah alur kerja: Permintaan -> Sampel -> Hasil -> Validasi,
 * serta Manajemen Stok & Reagen (core fitur prediksi ARIMA).
 * Tabel master existing (lab_jenis_pemeriksaan, lab_item, tarif_lab) TIDAK diubah.
 */
class LabOperasionalSchema extends Schema {
  up () {
    /* Master Reagen / BHP */
    this.schema.createTable('lab_reagen', table => {
      table.increments()
      table.string('kode_reagen', 20).notNullable().unique()
      table.string('nama_reagen', 150).notNullable()
      table.string('satuan', 30).defaultTo('Botol')
      table.integer('stok').notNullable().defaultTo(0)
      table.integer('safety_stock').notNullable().defaultTo(5)
      table.date('expired_date').nullable()
      table.boolean('aktif').defaultTo(true)
      table.timestamps()
    })

    /* Relasi kebutuhan reagen per jenis pemeriksaan (BOM) */
    this.schema.createTable('lab_reagen_kebutuhan', table => {
      table.increments()
      table.string('kode_jenis', 20).references('kode_jenis').inTable('lab_jenis_pemeriksaan')
      table.integer('id_reagen').references('id').inTable('lab_reagen')
      table.decimal('jumlah_per_tes', 10, 2).notNullable().defaultTo(1)
      table.timestamps()
    })

    /* Transaksi stok reagen (masuk/pemakaian) */
    this.schema.createTable('lab_stok_transaksi', table => {
      table.increments()
      table.integer('id_reagen').references('id').inTable('lab_reagen')
      table.enum('tipe', ['MASUK', 'KELUAR']).notNullable()
      table.integer('jumlah').notNullable()
      table.string('keterangan', 255).nullable()
      table.timestamp('tanggal_transaksi').nullable()
      table.string('petugas', 100).nullable()
      table.timestamps()
    })

    /* Order permintaan pemeriksaan lab */
    this.schema.createTable('lab_permintaan', table => {
      table.increments()
      table.string('no_permintaan', 25).notNullable().unique()
      table.string('no_rm', 30).nullable()
      table.string('nama_pasien', 150).nullable()
      table.string('asal_ruangan', 100).nullable()
      table.string('dokter_pengirim', 150).nullable()
      table.string('kode_jenis', 20).references('kode_jenis').inTable('lab_jenis_pemeriksaan')
      table.enum('status', ['MENUNGGU SAMPEL', 'SAMPEL DITERIMA', 'SEDANG DIPERIKSA', 'MENUNGGU VALIDASI', 'SELESAI', 'DIBATALKAN']).defaultTo('MENUNGGU SAMPEL')
      table.timestamp('tanggal_permintaan').nullable()
      table.string('petugas', 100).nullable()
      table.timestamps()
    })

    /* Detail hasil pemeriksaan per item */
    this.schema.createTable('lab_hasil', table => {
      table.increments()
      table.integer('id_permintaan').references('id').inTable('lab_permintaan')
      table.string('kode_item', 20).nullable()
      table.string('nama_item', 150).nullable()
      table.string('hasil_nilai', 100).nullable()
      table.string('satuan', 30).nullable()
      table.string('nilai_normal', 100).nullable()
      table.boolean('kritis').defaultTo(false)
      table.timestamps()
    })
  }

  down () {
    this.schema.dropTable('lab_hasil')
    this.schema.dropTable('lab_permintaan')
    this.schema.dropTable('lab_stok_transaksi')
    this.schema.dropTable('lab_reagen_kebutuhan')
    this.schema.dropTable('lab_reagen')
  }
}

module.exports = LabOperasionalSchema

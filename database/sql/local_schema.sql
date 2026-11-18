-- Skema minimal DB lokal sim_rsi (pengganti server remote 103.120.232.123)
CREATE TABLE IF NOT EXISTS ruang_layanan (
  kode_ruang VARCHAR(20) PRIMARY KEY, nama_ruang VARCHAR(150), aktif BOOLEAN DEFAULT true
);
CREATE TABLE IF NOT EXISTS pegawai (
  nip VARCHAR(30) PRIMARY KEY, nama_pegawai VARCHAR(150), jk VARCHAR(1), tgl_lahir DATE, alamat TEXT,
  no_hp VARCHAR(20), id_satuan VARCHAR(20), id_jenis INTEGER, id_status INTEGER, email VARCHAR(100),
  password VARCHAR(100), foto VARCHAR(150), username VARCHAR(50), akses VARCHAR(30), active BOOLEAN DEFAULT true
);
CREATE TABLE IF NOT EXISTS spesialis (kode_spesialis VARCHAR(20) PRIMARY KEY, nama_spesialis VARCHAR(100));
CREATE TABLE IF NOT EXISTS dokter (nip_dokter VARCHAR(30) PRIMARY KEY, nama_dokter VARCHAR(150), kode_spesialis VARCHAR(20));
CREATE TABLE IF NOT EXISTS perawat (nip_perawat VARCHAR(30) PRIMARY KEY, nama_perawat VARCHAR(150));
CREATE TABLE IF NOT EXISTS pasien (no_rm VARCHAR(30) PRIMARY KEY, nama_pasien VARCHAR(150), jk VARCHAR(1), tgl_lahir DATE, alamat TEXT, no_hp VARCHAR(20));
CREATE TABLE IF NOT EXISTS tindakan (kode_tindakan VARCHAR(20) PRIMARY KEY, nama_tindakan VARCHAR(150));
CREATE TABLE IF NOT EXISTS billing_kelompok (id SERIAL PRIMARY KEY, kelompok VARCHAR(50));
CREATE TABLE IF NOT EXISTS basecodes (kode_base VARCHAR(20) PRIMARY KEY, nama_base VARCHAR(150));
CREATE TABLE IF NOT EXISTS modifiers (kode_modifier VARCHAR(20) PRIMARY KEY, nama_modifier VARCHAR(150));
CREATE TABLE IF NOT EXISTS wilayah (id_wilayah VARCHAR(20) PRIMARY KEY, nama_wilayah VARCHAR(150));
CREATE TABLE IF NOT EXISTS pabrik (kode_pabrik VARCHAR(20) PRIMARY KEY, nama_pabrik VARCHAR(150));
CREATE TABLE IF NOT EXISTS supplier (kode_supplier VARCHAR(20) PRIMARY KEY, nama_supplier VARCHAR(150));
CREATE TABLE IF NOT EXISTS satuan (id_satuan VARCHAR(20) PRIMARY KEY, nama_satuan VARCHAR(100));
CREATE TABLE IF NOT EXISTS rekening (kode_rekening VARCHAR(20) PRIMARY KEY, nama_rekening VARCHAR(150));
CREATE TABLE IF NOT EXISTS akses (kode_akses VARCHAR(30) PRIMARY KEY, nama_akses VARCHAR(100));
INSERT INTO ruang_layanan VALUES ('LAB','Instalasi Laboratorium',true) ON CONFLICT DO NOTHING;
INSERT INTO pasien VALUES ('000001','BUDI SANTOSO','L','1990-01-01','Jakarta','0812345678') ON CONFLICT DO NOTHING;

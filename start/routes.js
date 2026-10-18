'use strict'

/*
|--------------------------------------------------------------------------
| Routes — SIMRS Wisnuhusada
|--------------------------------------------------------------------------
| Kelompok rute:
|   1. Menu navigasi unit (halaman statis)
|   2. Master data CRUD (Pegawai, Pabrik, Satuan, dst.)
*/

const Route = use('Route')

// ===================== 1. Menu Navigasi Unit =====================
Route.get('/admin', 'Admin/DashboardController.index')
Route.get('/admin/menu_pendaftaran', 'Admin/MenuUnitController.pendaftaran')
Route.get('/admin/menu_keperawatan', 'Admin/MenuUnitController.keperawatan')
Route.get('/admin/menu_farmasi', 'Admin/MenuUnitController.farmasi')
Route.get('/admin/menu_radiologi', 'Admin/MenuUnitController.radiologi')
Route.get('/admin/menu_laboratorium', 'Admin/MenuUnitController.laboratorium')
Route.get('/admin/menu_kasir', 'Admin/MenuUnitController.kasir')
Route.get('/admin/menu_dokter', 'Admin/MenuUnitController.dokter')

// ===================== 2. Master Data =====================
Route.group(() => {
    Route.get('/', 'PegawaiController.index')
    Route.get('/data', 'PegawaiController.data')
    Route.get('/search', 'PegawaiController.search')
    Route.post('/store', 'PegawaiController.store')
    Route.post('/update/:id', 'PegawaiController.update')
    Route.delete('/delete/:id', 'PegawaiController.delete')
}).prefix('admin/pegawai')

Route.group(() => {
    Route.get('/', 'PabrikController.index')
    Route.get('/data', 'PabrikController.data')
    Route.post('/store', 'PabrikController.store')
    Route.post('/update', 'PabrikController.update')
    Route.post('/delete', 'PabrikController.delete')
}).prefix('admin/pabrik')

Route.group(() => {
    Route.get('/', 'SatuanController.index')
    Route.get('/data', 'SatuanController.data')
    Route.post('/store', 'SatuanController.store')
    Route.post('/update', 'SatuanController.update')
    Route.post('/delete', 'SatuanController.delete')
}).prefix('admin/satuan')

Route.group(() => {
    Route.get('/', 'RekeningController.index')
    Route.get('/data', 'RekeningController.data')
    Route.post('/store', 'RekeningController.store')
    Route.post('/update', 'RekeningController.update')
    Route.post('/delete', 'RekeningController.delete')
}).prefix('admin/rekening')

Route.group(() => {
    Route.get('/', 'SupplierController.index')
    Route.get('/data', 'SupplierController.data')
    Route.post('/store', 'SupplierController.store')
    Route.post('/update', 'SupplierController.update')
    Route.post('/delete', 'SupplierController.delete')
}).prefix('admin/supplier')

Route.group(() => {
    Route.get('/ruang_layanan', 'RuangLayananController.index')
    Route.get('/ruang_layanan/data', 'RuangLayananController.data')
    Route.post('/ruang_layanan/store', 'RuangLayananController.store')
    Route.post('/ruang_layanan/update/:id', 'RuangLayananController.update')
    Route.delete('/ruang_layanan/delete/:id', 'RuangLayananController.delete')
}).prefix('admin')

Route.group(() => {
    Route.get('/akses/data','AksesController.data')
    Route.post('/akses/store','AksesController.store')
    Route.post('/akses/update/:id','AksesController.update')
    Route.delete('/akses/delete/:id','AksesController.delete')
}).prefix('admin')

Route.group(() => {
    Route.get('/billing_kelompok', 'BillingKelompokController.index')
    Route.get('/billing_kelompok/data', 'BillingKelompokController.data')
    Route.post('/billing_kelompok/store', 'BillingKelompokController.store')
    Route.post('/billing_kelompok/update/:id', 'BillingKelompokController.update')
    Route.delete('/billing_kelompok/delete/:id', 'BillingKelompokController.delete')
}).prefix('admin')
// ===================== 3. Modul Laboratorium =====================
Route.group(() => {
    // Halaman utama modul lab (terintegrasi dgn navbar menu_laboratorium)
    Route.get('/', 'LaboratoriumController.index')

    // Master Data Jenis Pemeriksaan Lab
    Route.get('/jenis/data', 'LaboratoriumController.jenisData')
    Route.get('/jenis/dropdown', 'LaboratoriumController.jenisDropdown')
    Route.post('/jenis/store', 'LaboratoriumController.jenisStore')
    Route.post('/jenis/update/:id', 'LaboratoriumController.jenisUpdate')
    Route.delete('/jenis/delete/:id', 'LaboratoriumController.jenisDelete')

    // Master Data Item Pemeriksaan Lab
    Route.get('/item/data', 'LaboratoriumController.itemData')
    Route.post('/item/store', 'LaboratoriumController.itemStore')
    Route.post('/item/update/:id', 'LaboratoriumController.itemUpdate')
    Route.delete('/item/delete/:id', 'LaboratoriumController.itemDelete')

    // Tarif Lab per Ruang Layanan
    Route.get('/tarif/data', 'LaboratoriumController.tarifData')
    Route.post('/tarif/store', 'LaboratoriumController.tarifStore')
    Route.post('/tarif/update/:id', 'LaboratoriumController.tarifUpdate')
    Route.delete('/tarif/delete/:id', 'LaboratoriumController.tarifDelete')

    /* ---------- 1. Dashboard Laboratorium ---------- */
    Route.get('/dashboard', 'LaboratoriumDashboardController.dashboard')

    /* ---------- 2. Permintaan & Pendaftaran (Requisition) ---------- */
    Route.get('/permintaan', 'LaboratoriumDashboardController.permintaan')
    Route.get('/permintaan/data', 'LaboratoriumDashboardController.permintaanData')
    Route.post('/permintaan/store', 'LaboratoriumDashboardController.permintaanStore')
    Route.post('/permintaan/status/:id', 'LaboratoriumDashboardController.permintaanUpdateStatus')
    Route.delete('/permintaan/delete/:id', 'LaboratoriumDashboardController.permintaanDelete')

    /* ---------- 3. Proses Pemeriksaan (Workflow) ---------- */
    Route.get('/pemeriksaan', 'LaboratoriumDashboardController.pemeriksaan')
    Route.get('/pemeriksaan/antrian', 'LaboratoriumDashboardController.antrianData')
    Route.get('/pemeriksaan/items/:kode_jenis', 'LaboratoriumDashboardController.itemsByJenis')
    Route.get('/pemeriksaan/hasil/:id', 'LaboratoriumDashboardController.hasilList')
    Route.post('/pemeriksaan/hasil/:id', 'LaboratoriumDashboardController.hasilSimpan')
    Route.post('/pemeriksaan/validasi/:id', 'LaboratoriumDashboardController.validasi')
    Route.get('/pemeriksaan/cetak/:id', 'LaboratoriumDashboardController.cetakHasil')

    /* ---------- 4. Manajemen Stok & Reagen (Core ARIMA) ---------- */
    Route.get('/stok', 'LaboratoriumDashboardController.stok')
    Route.get('/stok/reagen/data', 'LaboratoriumDashboardController.reagenData')
    Route.get('/stok/reagen/dropdown', 'LaboratoriumDashboardController.reagenDropdown')
    Route.post('/stok/reagen/store', 'LaboratoriumDashboardController.reagenStore')
    Route.post('/stok/reagen/update/:id', 'LaboratoriumDashboardController.reagenUpdate')
    Route.delete('/stok/reagen/delete/:id', 'LaboratoriumDashboardController.reagenDelete')
    Route.post('/stok/transaksi', 'LaboratoriumDashboardController.stokTransaksi')
    Route.get('/stok/riwayat', 'LaboratoriumDashboardController.stokRiwayat')
    Route.get('/stok/kebutuhan/data', 'LaboratoriumDashboardController.kebutuhanData')
    Route.post('/stok/kebutuhan/store', 'LaboratoriumDashboardController.kebutuhanStore')
    Route.delete('/stok/kebutuhan/delete/:id', 'LaboratoriumDashboardController.kebutuhanDelete')
    Route.get('/stok/prediksi', 'LaboratoriumDashboardController.prediksi')
    Route.get('/stok/kedaluwarsa', 'LaboratoriumDashboardController.kedaluwarsa')

    /* ---------- 5. Laporan & Analitik ---------- */
    Route.get('/laporan', 'LaboratoriumDashboardController.laporan')
    Route.get('/laporan/volume', 'LaboratoriumDashboardController.laporanVolume')
    Route.get('/laporan/efisiensi', 'LaboratoriumDashboardController.laporanEfisiensi')
    Route.get('/laporan/pendapatan', 'LaboratoriumDashboardController.laporanPendapatan')
}).prefix('admin/laboratorium')

// 🔒 Grup admin
Route.group(() => {
  // ✅ Tampilkan halaman spesialis
  Route.get('spesialis', 'SpesialisController.index').as('spesialis.index')
  // 🔧 API: Ambil data untuk DataTable
  Route.get('spesialis/list', 'SpesialisController.list')
  Route.get('/spesialis/dropdown', 'SpesialisController.dropdown');
  // 💾 Simpan data baru
  Route.post('spesialis', 'SpesialisController.store')
  // 📝 Update data (simulasi PUT via POST + _method)
  Route.post('spesialis/:id', 'SpesialisController.update')
  // 🗑️ Hapus data
  Route.delete('spesialis/:id', 'SpesialisController.destroy')

  //Form Dokter
  
  //Route.get('/dokter', 'DokterController.index')
  Route.get('/dokter/data', 'DokterController.data')
  Route.post('/dokter/store', 'DokterController.store')
  Route.post('/dokter/update/:id', 'DokterController.update')
  Route.post('/dokter/delete/:id', 'DokterController.destroy') 
  

  //Form Perawat
  Route.get('/perawat', 'PerawatController.index').as('perawat.index')
  Route.get('/perawat/data', 'PerawatController.data').as('perawat.data')
  Route.post('/perawat', 'PerawatController.store').as('perawat.store')
  Route.post('/perawat/:nip', 'PerawatController.update').as('perawat.update') // pakai POST untuk FormData
  Route.delete('/perawat/:nip', 'PerawatController.destroy').as('perawat.destroy')

  Route.get('/pasien', 'PasientController.index') // menampilkan view
  Route.get('/pasien/datatables', 'PasientController.datatables')
  Route.get('/pasien/:no_rm', 'PasientController.show')
  Route.post('/pasien', 'PasientController.store')
  Route.put('/pasien/:no_rm', 'PasientController.update')
  Route.delete('/pasien/:no_rm', 'PasientController.destroy')

   //Form Tindakan
  Route.get('/tindakan', 'TindakanController.index')
  Route.get('/tindakan/data', 'TindakanController.data')
  Route.post('/tindakan', 'TindakanController.store')
  Route.put('/tindakan/:kdTindakan', 'TindakanController.update')
  Route.delete('/tindakan/:kdTindakan', 'TindakanController.destroy')
 
  Route.get('/basecode', 'BasecodeController.index')
  Route.get('/basecode/data', 'BasecodeController.data')
  Route.post('/basecode', 'BasecodeController.store')
  Route.put('/basecode/:id', 'BasecodeController.update')
  Route.delete('/basecode/:id', 'BasecodeController.destroy')
  Route.get('/basecode/list', 'BasecodeController.list') // Ambil list modifiers
  Route.get('/basecode/:id', 'BasecodeController.show')
  Route.get('/modifiers', 'ModifierController.index')
  
  Route.get('/modifiers/data', 'ModifierController.data')
  Route.post('/modifiers', 'ModifierController.store')
  Route.put('/modifiers/:code', 'ModifierController.update')
  Route.delete('/modifiers/:code', 'ModifierController.delete')

   // Halaman utama wilayah
  Route.get('/wilayah', async ({ view }) => {
    return view.render('admin/wilayah')
  })

  Route.get('/wilayah/provinsi', 'WilayahController.getProvinsi')
  Route.get('/wilayah/kabupaten/:code', 'WilayahController.getKabupaten')
  Route.get('/wilayah/kecamatan/:code', 'WilayahController.getKecamatan')
  Route.get('/wilayah/kelurahan/:code', 'WilayahController.getKelurahan')

}).prefix('admin')

Route.get('/admin/dokter', ({ view }) => 
  {
    return view.render('admin.dokter')
  })

.middleware(['cors']) // ← gunakan middleware cors
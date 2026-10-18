/* Modul Lab — Permintaan & Pendaftaran (Requisition) */
$.ajaxSetup({ headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') } })

let tablePermintaan = null

function initTable () {
  if (tablePermintaan) tablePermintaan.destroy()
  tablePermintaan = $('#permintaanTable').DataTable({
    serverSide: false,
    ajax: { url: '/admin/laboratorium/permintaan/data', dataSrc: 'data' },
    columns: [
      { data: null, render: (d, t, s, i) => i + 1 },
      { data: 'no_permintaan' },
      { data: null, render: d => `${d.nama_pasien || '-'} (${d.no_rm || '-'})` },
      { data: 'asal_ruangan' },
      { data: 'dokter_pengirim' },
      { data: 'nama_pemeriksaan' },
      { data: 'status', render: s => {
          const warna = { 'MENUNGGU SAMPEL': 'secondary', 'SAMPEL DITERIMA': 'info', 'SEDANG DIPERIKSA': 'warning text-dark', 'MENUNGGU VALIDASI': 'primary', 'SELESAI': 'success', 'DIBATALKAN': 'dark' }[s] || 'secondary'
          return `<span class="badge bg-${warna}">${s}</span>`
        } },
      { data: null, orderable: false, render: d => `
          <div class="btn-group btn-group-sm">
            ${d.status === 'MENUNGGU SAMPEL' ? `<button class="btn btn-outline-info btn-terima" data-id="${d.id}" title="Terima Sampel"><i class="fas fa-vial"></i></button>` : ''}
            <button class="btn btn-outline-primary btn-barcode" data-no="${d.no_permintaan}" data-pasien="${d.nama_pasien || ''}" title="Cetak Label Barcode"><i class="fas fa-barcode"></i></button>
            <button class="btn btn-outline-danger btn-hapus" data-id="${d.id}" title="Hapus"><i class="fas fa-trash"></i></button>
          </div>` }
    ]
  })
}

function loadJenisDropdown () {
  $.get('/admin/laboratorium/jenis/dropdown', res => {
    let opt = '<option value="">-- Pilih Jenis Pemeriksaan --</option>'
    ;(res.data || []).forEach(j => {
      opt += `<option value="${j.kode_jenis}">${j.nama_pemeriksaan}</option>`
    })
    $('#selJenis').html(opt)
  })
}

$(function () {
  initTable()
  loadJenisDropdown()

  $('#btnAddPermintaan').on('click', () => new bootstrap.Modal('#modalPermintaan').show())

  $('#formPermintaan').on('submit', function (e) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(this).entries())
    $.post('/admin/laboratorium/permintaan/store', data, res => {
      bootstrap.Modal.getInstance(document.querySelector('#modalPermintaan')).hide()
      this.reset()
      initTable()
      showBarcode(res.no_permintaan, data.nama_pasien)
    }).fail(xhr => alert('Gagal: ' + (xhr.responseJSON && xhr.responseJSON.error)))
  })

  // Terima sampel → status SAMPEL DITERIMA
  $('#permintaanTable').on('click', '.btn-terima', function () {
    $.post(`/admin/laboratorium/permintaan/status/${$(this).data('id')}`, { status: 'SAMPEL DITERIMA' }, initTable)
  })

  // Hapus permintaan
  $('#permintaanTable').on('click', '.btn-hapus', function () {
    if (!confirm('Hapus permintaan ini?')) return
    $.ajax({ url: `/admin/laboratorium/permintaan/delete/${$(this).data('id')}`, type: 'DELETE', success: initTable })
  })

  // Cetak label barcode
  $('#permintaanTable').on('click', '.btn-barcode', function () {
    showBarcode($(this).data('no'), $(this).data('pasien'))
  })
})

function showBarcode (no, pasien) {
  $('#barcodeNo').text(no)
  $('#barcodePasien').text(pasien)
  try {
    JsBarcode('#barcodeCanvas', no, { format: 'CODE39', width: 1.5, height: 60, displayValue: true })
  } catch (e) { $('#barcodeText').text(no) }
  new bootstrap.Modal('#modalBarcode').show()
}

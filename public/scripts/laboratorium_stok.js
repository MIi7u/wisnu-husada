/* Modul Lab — Manajemen Stok & Reagen + Prediksi ARIMA (core skripsi) */
$.ajaxSetup({ headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') } })

let tReagen = null, tRiwayat = null, tPrediksi = null, tExpired = null, tKebutuhan = null
let chartPrediksi = null

function initTables () {
  if (tReagen) tReagen.destroy()
  tReagen = $('#reagenTable').DataTable({
    ajax: { url: '/admin/laboratorium/stok/reagen/data', dataSrc: 'data' },
    columns: [
      { data: null, render: (d, t, s, i) => i + 1 },
      { data: 'kode_reagen' }, { data: 'nama_reagen' }, { data: 'satuan' },
      { data: 'stok', render: (v, t, d) => v <= d.safety_stock ? `<span class="badge bg-danger">${v}</span>` : v },
      { data: 'safety_stock' },
      { data: 'expired_date', render: v => v ? String(v).slice(0, 10) : '-' },
      { data: 'aktif', render: v => v ? '<span class="badge bg-success">Aktif</span>' : '<span class="badge bg-secondary">Nonaktif</span>' },
      { data: null, orderable: false, render: d => `
        <button class="btn btn-sm btn-outline-primary btn-edit" data-row='${JSON.stringify(d)}'><i class="fas fa-pen"></i></button>
        <button class="btn btn-sm btn-outline-danger btn-hapus" data-id="${d.id}"><i class="fas fa-trash"></i></button>` }
    ]
  })

  if (tRiwayat) tRiwayat.destroy()
  tRiwayat = $('#riwayatTable').DataTable({
    ajax: { url: '/admin/laboratorium/stok/riwayat', dataSrc: 'data' },
    columns: [
      { data: null, render: (d, t, s, i) => i + 1 },
      { data: 'tanggal_transaksi', render: v => v ? String(v).replace('T', ' ').slice(0, 16) : '-' },
      { data: 'nama_reagen' },
      { data: 'tipe', render: v => v === 'MASUK' ? '<span class="badge bg-success">MASUK</span>' : '<span class="badge bg-danger">KELUAR</span>' },
      { data: 'jumlah' }, { data: 'petugas' }, { data: 'keterangan' }
    ],
    order: [[0, 'desc']]
  })
}

function loadDropdowns (cb) {
  $.when(
    $.get('/admin/laboratorium/stok/reagen/dropdown'),
    $.get('/admin/laboratorium/jenis/dropdown')
  ).then(([resR], [resJ]) => {
    const optR = (resR.data || []).map(r => `<option value="${r.id}">${r.nama_reagen} (${r.satuan})</option>`).join('')
    $('#selReagenTrx, #selReagenKb').html(optR)
    $('#selJenisKb').html((resJ.data || []).map(j => `<option value="${j.kode_jenis}">${j.nama_pemeriksaan}</option>`).join(''))
    if (cb) cb()
  })
}

$(function () {
  initTables()
  loadDropdowns()
  initKebutuhanTable()

  // ===== Master Reagen =====
  $('#btnAddReagen').on('click', function () {
    $('#formReagen')[0].reset(); $('#reagenId').val(''); $('#judulReagen').text('Tambah Reagen')
    $('#wrapAktif').hide(); $('[name=stok]').prop('disabled', false)
    new bootstrap.Modal('#modalReagen').show()
  })
  $('#reagenTable').on('click', '.btn-edit', function () {
    const d = JSON.parse($(this).data('row'))
    $('#formReagen').find('[name=kode_reagen]').val(d.kode_reagen)
    $('#formReagen').find('[name=nama_reagen]').val(d.nama_reagen)
    $('#formReagen').find('[name=satuan]').val(d.satuan)
    $('#formReagen').find('[name=safety_stock]').val(d.safety_stock)
    $('#formReagen').find('[name=expired_date]').val(d.expired_date ? String(d.expired_date).slice(0, 10) : '')
    $('#formReagen').find('[name=aktif]').val(String(!!d.aktif))
    $('#reagenId').val(d.id); $('#judulReagen').text('Edit Reagen')
    $('#wrapAktif').show(); $('[name=stok]').prop('disabled', true)
    new bootstrap.Modal('#modalReagen').show()
  })
  $('#reagenTable').on('click', '.btn-hapus', function () {
    if (!confirm('Hapus reagen ini?')) return
    $.ajax({ url: `/admin/laboratorium/stok/reagen/delete/${$(this).data('id')}`, type: 'DELETE', success: initTables })
  })
  $('#formReagen').on('submit', function (e) {
    e.preventDefault()
    const id = $('#reagenId').val()
    const url = id ? `/admin/laboratorium/stok/reagen/update/${id}` : '/admin/laboratorium/stok/reagen/store'
    $.post(url, Object.fromEntries(new FormData(this).entries()), () => {
      bootstrap.Modal.getInstance(document.querySelector('#modalReagen')).hide(); initTables()
    }).fail(xhr => alert('Gagal: ' + (xhr.responseJSON && xhr.responseJSON.error)))
  })

  // ===== Transaksi =====
  $('#btnTransaksi').on('click', () => new bootstrap.Modal('#modalTrx').show())
  $('#formTrx').on('submit', function (e) {
    e.preventDefault()
    $.post('/admin/laboratorium/stok/transaksi', Object.fromEntries(new FormData(this).entries()), () => {
      bootstrap.Modal.getInstance(document.querySelector('#modalTrx')).hide()
      this.reset(); initTables()
    }).fail(xhr => alert('Gagal: ' + (xhr.responseJSON && xhr.responseJSON.error)))
  })

  // ===== Kebutuhan BOM =====
  $('#btnAddKebutuhan').on('click', () => new bootstrap.Modal('#modalKebutuhan').show())
  $('#formKebutuhan').on('submit', function (e) {
    e.preventDefault()
    $.post('/admin/laboratorium/stok/kebutuhan/store', Object.fromEntries(new FormData(this).entries()), () => {
      bootstrap.Modal.getInstance(document.querySelector('#modalKebutuhan')).hide()
      this.reset(); initKebutuhanTable()
    }).fail(xhr => alert('Gagal: ' + (xhr.responseJSON && xhr.responseJSON.error)))
  })

  // ===== Jalankan Prediksi ARIMA =====
  $('#btnPrediksi').on('click', function () {
    const btn = this; btn.disabled = true
    $.get('/admin/laboratorium/stok/prediksi', { horizon: $('#selHorizon').val() }, res => {
      btn.disabled = false
      $('#metodeLabel').text(res.metode)
      if (tPrediksi) tPrediksi.destroy()
      tPrediksi = $('#prediksiTable').DataTable({
        data: res.data,
        columns: [
          { data: 'kode_reagen' }, { data: 'nama_reagen' },
          { data: 'stok' }, { data: 'prediksi_kebutuhan' },
          { data: 'rekomendasi_pesan', render: v => v > 0 ? `<span class="badge bg-danger">${v}</span>` : `<span class="badge bg-success">0 (aman)</span>` }
        ]
      })
      // Banner peringatan dini untuk reagen yang perlu pesan
      const kritis = (res.data || []).filter(d => d.rekomendasi_pesan > 0)
      if (kritis.length) {
        const k = kritis[0]
        $('#bannerArimaText').html(`Berdasarkan prediksi ${res.metode}, kebutuhan <strong>${k.nama_reagen}</strong> bulan-bulan depan diprediksi <strong>${k.prediksi_kebutuhan} ${k.satuan}</strong>. Stok saat ini hanya <strong>${k.stok} ${k.satuan}</strong>. Segera lakukan pengadaan!`)
        $('#bannerArima').removeClass('d-none')
      } else {
        $('#bannerArima').addClass('d-none')
      }
      drawChart(res.data)
    }).fail(xhr => { btn.disabled = false; alert('Gagal: ' + (xhr.responseJSON && xhr.responseJSON.error)) })
  })

  // ===== Kedaluwarsa =====
  $('#btnExpired').on('click', loadExpired)
  loadExpired()
})

function loadExpired () {
  $.get('/admin/laboratorium/stok/kedaluwarsa', { hari: 60 }, res => {
    if (tExpired) tExpired.destroy()
    tExpired = $('#expiredTable').DataTable({
      data: res.data,
      columns: [
        { data: 'kode_reagen' }, { data: 'nama_reagen' }, { data: 'satuan' }, { data: 'stok' },
        { data: 'expired_date', render: v => String(v).slice(0, 10) },
        { data: 'expired_date', render: v => {
            const sisa = Math.ceil((new Date(v) - Date.now()) / 86400000)
            return sisa < 0 ? `<span class="badge bg-dark">Sudah expired</span>` :
                   sisa <= 30 ? `<span class="badge bg-danger">${sisa} hari</span>` :
                   `<span class="badge bg-warning text-dark">${sisa} hari</span>`
          } }
      ]
    })
  })
}

function initKebutuhanTable () {
  if (tKebutuhan) tKebutuhan.destroy()
  tKebutuhan = $('#kebutuhanTable').DataTable({
    ajax: { url: '/admin/laboratorium/stok/kebutuhan/data', dataSrc: 'data' },
    columns: [
      { data: null, render: (d, t, s, i) => i + 1 },
      { data: 'nama_pemeriksaan' }, { data: 'nama_reagen' },
      { data: null, render: d => `${d.jumlah_per_tes} ${d.satuan || ''}` },
      { data: null, orderable: false, render: d => `<button class="btn btn-sm btn-outline-danger kb-hapus" data-id="${d.id}"><i class="fas fa-trash"></i></button>` }
    ]
  })
}
$('#kebutuhanTable').on('click', '.kb-hapus', function () {
  if (!confirm('Hapus relasi ini?')) return
  $.ajax({ url: `/admin/laboratorium/stok/kebutuhan/delete/${$(this).data('id')}`, type: 'DELETE', success: initKebutuhanTable })
})

/** Grafik historis vs prediksi (visualisasi sederhana dari hasil rekomendasi) */
function drawChart (data) {
  const labels = data.map(d => d.nama_reagen)
  const ctx = document.getElementById('chartPrediksi')
  if (chartPrediksi) chartPrediksi.destroy()
  chartPrediksi = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Stok Saat Ini', data: data.map(d => d.stok), backgroundColor: '#0d6efd' },
        { label: 'Prediksi Kebutuhan', data: data.map(d => d.prediksi_kebutuhan), backgroundColor: '#ffc107' },
        { label: 'Rekomendasi Pesan', data: data.map(d => d.rekomendasi_pesan), backgroundColor: '#dc3545' }
      ]
    },
    options: { responsive: true, plugins: { title: { display: true, text: 'Perbandingan Stok vs Prediksi Kebutuhan Reagen' } } }
  })
}

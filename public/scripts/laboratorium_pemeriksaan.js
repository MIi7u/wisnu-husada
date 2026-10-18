/* Modul Lab — Proses Pemeriksaan (Workflow) */
$.ajaxSetup({ headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') } })

let idAktif = null

function badgeStatus (s) {
  const warna = { 'SAMPEL DITERIMA': 'info', 'SEDANG DIPERIKSA': 'warning text-dark', 'MENUNGGU VALIDASI': 'primary' }[s] || 'secondary'
  return `<span class="badge bg-${warna}">${s}</span>`
}

function loadAntrian () {
  $.get('/admin/laboratorium/pemeriksaan/antrian', res => {
    const rows = (res.data || []).map(d => {
      let aksi = ''
      if (d.status === 'SAMPEL DITERIMA') {
        aksi = `<button class="btn btn-sm btn-outline-warning btn-periksa" data-id="${d.id}" data-jenis="${d.kode_jenis}" data-no="${d.no_permintaan}"><i class="fas fa-vial-circle me-1"></i>Input Hasil</button>`
      } else if (d.status === 'SEDANG DIPERIKSA') {
        aksi = `<button class="btn btn-sm btn-outline-warning btn-periksa" data-id="${d.id}" data-jenis="${d.kode_jenis}" data-no="${d.no_permintaan}"><i class="fas fa-pen me-1"></i>Lanjut Input</button>`
      } else if (d.status === 'MENUNGGU VALIDASI') {
        aksi = `<button class="btn btn-sm btn-outline-success btn-validasi" data-id="${d.id}" data-no="${d.no_permintaan}"><i class="fas fa-user-doctor me-1"></i>Validasi</button>`
      }
      return `<tr>
        <td>${d.no_permintaan}</td>
        <td>${d.nama_pasien || '-'} (${d.no_rm || '-'})</td>
        <td>${d.nama_pemeriksaan || '-'}</td>
        <td>${badgeStatus(d.status)}</td>
        <td>${aksi}</td></tr>`
    }).join('')
    $('#antrianBody').html(rows || '<tr><td colspan="5" class="text-center text-muted py-4">Antrian kosong.</td></tr>')
  })
}

$(function () {
  loadAntrian()
  $('#btnRefresh').on('click', loadAntrian)

  // ==== Input Hasil ====
  $('#antrianBody').on('click', '.btn-periksa', function () {
    idAktif = $(this).data('id')
    const kodeJenis = $(this).data('jenis')
    $('#hasilNoReq').text($(this).data('no'))
    $.get(`/admin/laboratorium/pemeriksaan/items/${kodeJenis}`, res => {
      const rows = (res.data || []).map(it => `
        <tr data-kode="${it.kode_item}">
          <td>${it.nama_item}<input type="hidden" name="nama_item" value="${it.nama_item}"></td>
          <td><input class="form-control form-control-sm input-nilai" data-satuan="${it.satuan || ''}" data-normal=""></td>
          <td>${it.satuan || '-'}</td>
          <td><input class="form-control form-control-sm input-normal" placeholder="mis. 12.0-16.0"></td>
          <td class="text-center"><input type="checkbox" class="form-check-input input-kritis"></td>
        </tr>`).join('')
      $('#itemHasilBody').html(rows || '<tr><td colspan="5" class="text-muted text-center">Belum ada item untuk jenis ini. Buat di Pengaturan → Item Pemeriksaan Lab.</td></tr>')
      new bootstrap.Modal('#modalHasil').show()
    })
  })

  $('#formHasil').on('submit', function (e) {
    e.preventDefault()
    const items = []
    $('#itemHasilBody tr').each(function () {
      items.push({
        kode_item: $(this).data('kode'),
        nama_item: $(this).find('input[name="nama_item"]').val(),
        hasil_nilai: $(this).find('.input-nilai').val(),
        satuan: $(this).find('.input-nilai').data('satuan'),
        nilai_normal: $(this).find('.input-normal').val(),
        kritis: $(this).find('.input-kritis').is(':checked')
      })
    })
    $.post(`/admin/laboratorium/pemeriksaan/hasil/${idAktif}`, { items }, () => {
      bootstrap.Modal.getInstance(document.querySelector('#modalHasil')).hide()
      loadAntrian()
    }).fail(xhr => alert('Gagal: ' + (xhr.responseJSON && xhr.responseJSON.error)))
  })

  // ==== Validasi ====
  $('#antrianBody').on('click', '.btn-validasi', function () {
    idAktif = $(this).data('id')
    $('#btnCetakValidasi').attr('href', `/admin/laboratorium/pemeriksaan/cetak/${idAktif}`)
    $.get(`/admin/laboratorium/pemeriksaan/hasil/${idAktif}`, res => {
      const rows = (res.data || []).map(h => `<tr class="${h.kritis ? 'table-danger' : ''}">
        <td>${h.nama_item}</td><td>${h.hasil_nilai}</td><td>${h.satuan || ''}</td>
        <td>${h.nilai_normal || ''}</td><td>${h.kritis ? '<span class="badge bg-danger">KRITIS</span>' : '<span class="badge bg-success">Normal</span>'}</td>
      </tr>`).join('')
      $('#validasiBody').html(rows || '<tr><td colspan="5" class="text-muted text-center">Tidak ada hasil.</td></tr>')
      new bootstrap.Modal('#modalValidasi').show()
    })
  })

  $('#btnSetujui').on('click', () => {
    $.post(`/admin/laboratorium/pemeriksaan/validasi/${idAktif}`, { setujui: 'true' }, () => {
      bootstrap.Modal.getInstance(document.querySelector('#modalValidasi')).hide()
      loadAntrian()
    })
  })
  $('#btnTolak').on('click', () => {
    $.post(`/admin/laboratorium/pemeriksaan/validasi/${idAktif}`, { setujui: 'false' }, () => {
      bootstrap.Modal.getInstance(document.querySelector('#modalValidasi')).hide()
      loadAntrian()
    })
  })
})

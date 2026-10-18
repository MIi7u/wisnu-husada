/* Modul Lab — Laporan & Analitik */
$.ajaxSetup({ headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') } })

const fmtRp = n => new Intl.NumberFormat('id-ID').format(Number(n) || 0)

$(function () {
  // Volume Pemeriksaan
  $.get('/admin/laboratorium/laporan/volume', res => {
    const data = res.data || []
    $('#tblVolume').html(data.map(d => `<tr><td>${d.label || '-'}</td><td class="text-end">${d.jumlah}</td></tr>`).join('') || '<tr><td colspan="2" class="text-muted text-center">Belum ada data.</td></tr>')
    new Chart(document.getElementById('chartVolume'), {
      type: 'bar',
      data: { labels: data.map(d => d.label || '-'), datasets: [{ label: 'Jumlah Pemeriksaan', data: data.map(d => Number(d.jumlah)), backgroundColor: '#0d6efd' }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false } } }
    })
  })

  // Efisiensi Stok (pemakaian aktual)
  $.get('/admin/laboratorium/laporan/efisiensi', res => {
    const data = res.data || []
    $('#tblEfisiensi').html(data.map(d => `<tr><td>${d.label || '-'}</td><td class="text-end">${fmtRp(d.terpakai)}</td></tr>`).join('') || '<tr><td colspan="2" class="text-muted text-center">Belum ada data pemakaian reagen.</td></tr>')
    // gabungkan dengan prediksi utk perbandingan
    $.get('/admin/laboratorium/stok/prediksi', { horizon: 1 }, pr => {
      const rows = (pr.data || []).filter(d => d.prediksi_kebutuhan > 0 || d.stok > 0)
      new Chart(document.getElementById('chartEfisiensi'), {
        type: 'line',
        data: {
          labels: rows.map(d => d.nama_reagen),
          datasets: [
            { label: 'Prediksi Kebutuhan', data: rows.map(d => d.prediksi_kebutuhan), borderColor: '#ffc107', tension: 0.3 },
            { label: 'Stok Aktual', data: rows.map(d => d.stok), borderColor: '#0d6efd', tension: 0.3 }
          ]
        }
      })
    })
  })

  // Pendapatan Lab
  $.get('/admin/laboratorium/laporan/pendapatan', res => {
    const data = res.data || []
    let tJml = 0, tRp = 0
    $('#tblPendapatan').html(data.map(d => {
      tJml += Number(d.jumlah); tRp += Number(d.pendapatan)
      return `<tr><td>${d.label || '-'}</td><td class="text-end">${d.jumlah}</td><td class="text-end">Rp ${fmtRp(d.pendapatan)}</td></tr>`
    }).join('') || '<tr><td colspan="3" class="text-muted text-center">Belum ada pemeriksaan selesai.</td></tr>')
    $('#totJml').text(tJml)
    $('#totRp').text('Rp ' + fmtRp(tRp))
  })
})

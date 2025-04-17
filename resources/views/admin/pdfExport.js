
// ===== Fungsi Konversi Angka ke Terbilang =====
function convertToTerbilang(angka) {
    const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
    const tingkat = ['', 'ribu', 'juta', 'miliar', 'triliun'];
  
    if (angka === 0) return 'nol';
  
    let hasil = '';
    let i = 0;
  
    while (angka > 0) {
      const tigaAngka = angka % 1000;
      if (tigaAngka > 0) {
        const terbilangTiga = convertRatusan(tigaAngka);
        hasil = terbilangTiga + ' ' + tingkat[i] + ' ' + hasil;
      }
      angka = Math.floor(angka / 1000);
      i++;
    }
  
    return hasil.trim().replace(/\s+/g, ' ');
  }
  
  function convertRatusan(nilai) {
    const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
    let hasil = '';
  
    const ratus = Math.floor(nilai / 100);
    const puluhSatuan = nilai % 100;
    const puluh = Math.floor(puluhSatuan / 10);
    const satu = puluhSatuan % 10;
  
    if (ratus > 0) {
      hasil += (ratus === 1 ? 'seratus' : satuan[ratus] + ' ratus') + ' ';
    }
  
    if (puluhSatuan > 0) {
      if (puluh === 1) {
        if (satu === 0) {
          hasil += 'sepuluh ';
        } else if (satu === 1) {
          hasil += 'sebelas ';
        } else {
          hasil += satuan[satu] + ' belas ';
        }
      } else if (puluh > 1) {
        hasil += satuan[puluh] + ' puluh ';
        if (satu > 0) hasil += satuan[satu] + ' ';
      } else if (satu > 0) {
        hasil += satuan[satu] + ' ';
      }
    }
  
    return hasil.trim();
  }
  
  // ===== Fungsi Export PDF =====
  function exportAllTables() {
    const totalYangDiterima = parseFloat(document.getElementById('yangDiterima').innerText.replace(/[^\d]/g, '')) || 0;
    const terbilang = convertToTerbilang(totalYangDiterima);
    const terbilangFormatted = terbilang.charAt(0).toUpperCase() + terbilang.slice(1) + ' rupiah';
  
    const docDefinition = {
      content: [
        { text: 'RINCIAN JASA MEDIS PASIEN BPJS', style: 'header', alignment: 'center', margin: [0, 0, 0, 10] },
        { text: 'RUMAH SAKIT ISLAM PURWOKERTO', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 10] },
  
        { 
          text: 'Terbilang: ' + terbilangFormatted, 
          margin: [0, 0, 0, 10], 
          bold: true, 
          italics: true 
        },
  
        ...tableToPdfContent('Table1', 'Rawat Jalan'),
        ...tableToPdfContent('Table2', 'Rawat Inap')
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true
        },
        subheader: {
          fontSize: 14,
          bold: true
        },
        tableTitle: {
          fontSize: 13,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        }
      }
    };
  
    pdfMake.createPdf(docDefinition).download('laporan_dpjp.pdf');
  }
  
  // ===== Fungsi Convert Tabel HTML ke PDF =====
  function tableToPdfContent(tableId, title) {
    const table = document.getElementById(tableId);
    if (!table) return [];
  
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText);
    const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr =>
      Array.from(tr.querySelectorAll('td')).map(td => td.innerText)
    );
  
    return [
      { text: title, style: 'tableTitle' },
      {
        table: {
          headerRows: 1,
          widths: Array(headers.length).fill('*'),
          body: [headers, ...rows]
        },
        layout: 'lightHorizontalLines',
        style: 'tableExample'
      }
    ];
  }
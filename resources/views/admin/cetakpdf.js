// CETAK PDF  
async function exportPDFmake() {

  // Ambil data dari elemen HTML
   const rawValue = document.getElementById('startDate').value;
   if (!rawValue) {
      alert("Silakan pilih tanggal terlebih dahulu.");
      return;
    }
    const dateObj = new Date(rawValue);
    if (isNaN(dateObj)) {
      alert("Tanggal tidak valid.");
      return;
    }
    const bulan = dateObj.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric'
    });
   
   const select = document.getElementById("nipDokter");

   const selectedIndex = select.selectedIndex;
    if (selectedIndex === 0 || !select.value) {
        alert("Silakan pilih dokter terlebih dahulu.");
        return;
    }
   const selectedText = select.options[select.selectedIndex].text;
   const parts = selectedText.split(" - ");
    const nip = parts[0];           // 19830220
    const namaDokter = parts[1];    // dr. Rina Ayu
    const spesialis = parts[2];     // Spesialis Anak

    const totalRawatJalan = document.getElementById('totalRawatJalan').innerText || '0';
    const totalRawatInap = document.getElementById('totalRawatInap').innerText || '0';
    const totalSewaAlat = document.getElementById('totalSewaAlat').innerText || '0';
    const totalKeseluruhan = document.getElementById('totalKeseluruhan').innerText || '0';
    const ppn21 = document.getElementById('ppn21').innerText || '0';
    const yangDiterima = document.getElementById('yangDiterima').innerText || '0';

  if (!window.logoRSI) {
    alert("Logo base64 kosong. Pastikan file logo.js berisi logoRSI yang valid.");
    return;
  }
  console.log("ExportPDF jalan"); 

  // Logo dari file logo.js yang sudah base64
  const logoBase64 = window.logoRSI; // pastikan logoRSI = 'data:image/png;base64,...'
  console.log("Logo tersedia:", logoBase64.substring(0, 50));
  const table1 = $('#table1').DataTable();
  const table2 = $('#table2').DataTable();

  // Ambil semua data dari DataTable
  const data1 = table1.rows().data().toArray();

  const visibleIndexes2 = table2.columns(':visible').indexes().toArray();
  const data2 = table2.rows().data().toArray();

  // Buat header kolom
  const header1 = table1.columns().header().to$().map((i, th) => th.innerText).get();
  const header2 = table2.columns().header().to$().map((i, th) => th.innerText).get();

  // Buat struktur tabel
  // Buat struktur tabel
    const makeBody = (header, data) => {
    const body = [header];
    data.forEach(row => {
      body.push(Object.values(row));
    });
    return body;
  };

  const nipDokter = document.getElementById('nipDokter').innerText;

  const docDefinition = {
    pageOrientation: 'landscape',
    content: [
      { 
        columns: [
          {
            image: logoBase64,
            width: 50
          },
          [
            { text: 'Rumah Sakit Islam Purwokerto', style: 'header' },
            { text: 'Jalan H. Masyhuri No. 39, Kotak Pos 144 Purwokerto', style: 'subheader' },
            { text: 'Email: rsislam.purwokerto@gmail.com', style: 'subheader' },
            { text: 'Phone: +62 858-7503-5300', style: 'subheader' },
         
          ]
        ]
      },
      { text: 'RINCIAN JASA MEDIS PASIEN BPJS', style: 'title', margin: [0, 20, 0, 10] },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 770, y2: 0, lineWidth: 1 }
        ],
        margin: [0, 0, 0, 10]
      },

      {style: 'tabelInfo',
        table: {
          widths: [150,200], // Kolom label auto, kolom isi fleksibel
          body: [
            ['Nama :', namaDokter],
            ['Bulan Priode : ', bulan],
            ['Rawat Jalan : ', totalRawatJalan],
            ['Rawat Inap : ', totalRawatInap],
            ['Sewa Alat : ', totalSewaAlat],
            ['Total : ', totalKeseluruhan],
            ['PPN21 : ', ppn21],
            ['Yang Diterima :', yangDiterima],
            ['', '']
          ]
        },layout: 'noBorders'},
      
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 770, y2: 0, lineWidth: 1 }
        ],
        margin: [0, 0, 0, 10]
      },

     { text:'Purwokerto,'+bulan,margin: [500,20,0, 0],style: 'tableTitle' },
     {
        table: {
          widths: ['*', 50, '*'], // Kolom 1 dan 3 fleksibel, kolom 2 untuk spasi
          body: [
            [
              { text: 'Direktur', alignment: 'center', bold: true },
              '', // kolom kosong di tengah
              { text: 'Bag Pembukuan', alignment: 'center', bold: true }
            ]
          ]
        },
        layout: 'noBorders', // opsional, agar tanpa garis
        margin: [0,20, 0, 0] // beri jarak dari elemen sebelumnya
      },
     
     {
        table: {
          widths: ['*', 50, '*'], // Kolom 1 dan 3 fleksibel, kolom 2 untuk spasi
          body: [
            [
              { text: 'Amin Nurokhim, dr., Sp. OG', alignment: 'center', bold: true },
              '', // kolom kosong di tengah
              { text: 'Lutfian Fatmawati, SE', alignment: 'center', bold: true }
            ]
          ]
        },
        layout: 'noBorders', // opsional, agar tanpa garis
        margin: [0, 150, 0, 0] // beri jarak dari elemen sebelumnya
      },

      { text: 'Data Rawat Jalan', style: 'tableTitle' },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 770, y2: 0, lineWidth: 1 }
        ],
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: [150, 70,200, 50, 65,65], // Sesuaikan lebar kolom sesuai kebutuhan
          body: makeBody(header1, data1)
        },
        layout: 'lightHorizontalLines'
      },
        
// Rawat Inap

      { text: 'Data Rawat Inap', style: 'tableTitle', pageBreak: 'before' },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 770, y2: 0, lineWidth: 1 }
        ],
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: [0,40,150,50,'',40,60,40,60,60,60,60], // Sesuaikan lebar kolom sesuai kebutuhan
          body: makeBody(header2, data2)
        },
        layout: 'lightHorizontalLines'
      }
      
    ],
    styles: {
      header: { fontSize: 14, bold: true },
      subheader1: { fontSize: 12 },
      subheader: { fontSize: 8 },
      title: { fontSize: 12, bold: true, alignment: 'center' },
      tableTitle: { fontSize: 10, bold: true, margin: [0, 20, 0, 5] },
      total: { fontSize: 10, bold: true, alignment: 'right' }
    }
  };

 pdfMake.createPdf(docDefinition).download('Data_'+namaDokter+'.pdf');
}

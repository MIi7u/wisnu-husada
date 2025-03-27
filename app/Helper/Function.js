const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jum'at","Sabtu"];
const bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const bulan_anggaran = ["September","Oktober","November","Desember","Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus"];
const bulan_romawi = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"]
const bulan_sort = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agust","Sep","Okt","Nov","Des"];
const crypto = use('crypto');
const algorithm = 'aes-256-cbc'; //Using AES encryption
const key = "7991fc568e207d23dba028eb79ce5d208fd5300bf1730c8236af2e8c60a4057b";
const iv = "ef105fd580141487a2b448f13ac47837" ;
const Env            = use('Env')


//aws cloud

class Function {   
  static hitung_jarak(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius bumi dalam kilometer
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Jarak dalam kilometer
  
    return distance+(distance*20/100); //tambah sekitar 5% karna garis lurus
  }
  static pembilang(nilai) {
    nilai = Math.floor(Math.abs(nilai));
 
    var simpanNilaiBagi = 0;
    var huruf = [
      '',
      'Satu',
      'Dua',
      'Tiga',
      'Empat',
      'Lima',
      'Enam',
      'Tujuh',
      'Delapan',
      'Sembilan',
      'Sepuluh',
      'Sebelas',
    ];
    var temp = '';
   
    if (nilai < 12) {
      temp = ' ' + huruf[nilai];
    } else if (nilai < 20) {
      temp = pembilang(Math.floor(nilai - 10)) + ' Belas';
    } else if (nilai < 100) {
      simpanNilaiBagi = Math.floor(nilai / 10);
      temp = pembilang(simpanNilaiBagi) + ' Puluh' + pembilang(nilai % 10);
    } else if (nilai < 200) {
      temp = ' Seratus' + pembilang(nilai - 100);
    } else if (nilai < 1000) {
      simpanNilaiBagi = Math.floor(nilai / 100);
      temp = pembilang(simpanNilaiBagi) + ' Ratus' + pembilang(nilai % 100);
    } else if (nilai < 2000) {
      temp = ' Seribu' + pembilang(nilai - 1000);
    } else if (nilai < 1000000) {
      simpanNilaiBagi = Math.floor(nilai / 1000);
      temp = pembilang(simpanNilaiBagi) + ' Ribu' + pembilang(nilai % 1000);
    } else if (nilai < 1000000000) {
      simpanNilaiBagi = Math.floor(nilai / 1000000);
      temp = pembilang(simpanNilaiBagi) + ' Juta' + pembilang(nilai % 1000000);
    } else if (nilai < 1000000000000) {
      simpanNilaiBagi = Math.floor(nilai / 1000000000);
      temp =
        pembilang(simpanNilaiBagi) + ' Miliar' + pembilang(nilai % 1000000000);
    } else if (nilai < 1000000000000000) {
      simpanNilaiBagi = Math.floor(nilai / 1000000000000);
      temp = pembilang(nilai / 1000000000000) + ' Triliun' + pembilang(nilai % 1000000000000);
    }
   
    return temp;
  
}
  static get_bulan(bln,ta){
    let ta_i      = bln>4?parseInt(ta)+1:ta
    return bulan_anggaran[bln-1]+" "+ta_i
  }
  static rows(object){    
    return object.rows
  }

  static rows_mysql(object){
    const arrayData = object[0].map(packet =>
      Object.keys(packet).reduce((acc, key) => {
        acc[key] = packet[key];
        return acc;
      }, {})
    );
    return arrayData
  }
  static warna_grafik(){
    let warna       = [
                 'rgb(54, 162, 235)',
                 'rgb(255, 205, 86)',
                 'rgb(255, 99, 132)',
                 '#90EE90',
                 '#5F9EA0',
                 '#008B8B',
                 '#D2691E',
                 '#9932CC',
                 '#D3D3D3',
                 '#FFB6C1',
                 '#FFEBCD',
                 '#87CEEB',
                 '#FF6347',
                 '#DEB887',
                 '#2F4F4F',
                 '#DCDCDC'
                ]
      return warna
  }
  static contoh_filter_like(data, keyword) {
    return data.filter(function (el) {
      return new RegExp(keyword, 'i').test(el.harikerja_hari);
    })
}
static pembulatan_ribuan(number) {
  return Math.floor(number / 1000) * 1000;
}
    static getsemester(ta_masuk,ta){
      let tahun1      = ta_masuk.substring(0, 4)
      let smt1        = ta_masuk.substring(4,5)
      let tahun2      = ta.substring(0, 4)
      let smt2        = ta.substring(4,5)
      let semester    = 0
      let selisihta   = parseInt(tahun2)-parseInt(tahun1)
      let sks_kali    = (parseInt(smt2)-parseInt(smt1))==0?1:2
      if(selisihta>=0){
        if(selisihta==0){
          semester    = sks_kali
        }else{
          semester    = (selisihta*2)+sks_kali
        }
      }
      return semester
    }
    static verifi_hp(phoneNumber) {
      // Hapus spasi tambahan di awal dan akhir
      phoneNumber = phoneNumber.trim();
      
      // Normalisasi format nomor telepon
      // Hapus karakter non-numerik kecuali '+' dan '0'
      phoneNumber = phoneNumber.replace(/[^\d+]/g, '');
      
      // Verifikasi dan ganti awalan
      if (phoneNumber.startsWith('+')) {
          phoneNumber = phoneNumber.slice(1); // Hapus tanda '+'
      }
      
      if (phoneNumber.startsWith('0')) {
          phoneNumber = '62' + phoneNumber.slice(1); // Ganti awalan '0' dengan '62'
      } else if (!phoneNumber.startsWith('62')) {
          phoneNumber = '62' + phoneNumber; // Tambahkan '62' di depan jika tidak diawali dengan '62'
      }
  
      return phoneNumber+"@c.us"
  }
  static format_hp(input) {
    // Menghapus '@c.us'
    let formattedNumber = input.replace(/@c\.us$/, '');
    
    // Mengganti awalan '62' dengan '0'
    if (formattedNumber.startsWith('62')) {
        formattedNumber = '0' + formattedNumber.slice(2);
    }
    
    return formattedNumber;
}
  static random_token() {
      return Math.floor(1000 + Math.random() * 9000);
  }
    static getnamafile(d){
  
      let tgl    = ("0" + (d.getDate()-2)).slice(-2);
      let bulan   = ("0" + (d.getMonth() + 1)).slice(-2);
      let tahun    = d.getFullYear();   
      return  tahun+""+bulan+""+tgl;
  
  }
    static encrypt(text) {
        text    = String(text)       
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key,'hex'), Buffer.from(iv, 'hex'));
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return  encrypted.toString('hex')
    }
    static decrypt(text) {         
        let encryptedText = Buffer.from(text, 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key,'hex'), Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
     }
    static sort_datetime_en(tglnya){
        const d = new Date(tglnya);
        let date = ("0" + d.getDate()).slice(-2);
        let month = ("0" + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
        let jam = ("0" + (d.getHours())).slice(-2);
        let menit = ("0" + (d.getMinutes())).slice(-2);
        let detik = ("0" + (d.getSeconds())).slice(-2);
        let tgl = year+"-"+month+"-"+date+" "+jam+":"+menit+":"+detik;
        return tgl;
      }
      static nomor_spm(urut,unit,tglnya){
        const d = new Date(tglnya);    
        let year = d.getFullYear();      
        let nomor = urut+"/K/"+bulan_romawi[d.getMonth()]+"/"+year+"/"+unit;
        return nomor;
      }
      static nomor_laporan(unit){
        const d = new Date();    
        let year = d.getFullYear();    
        let jam = ("0" + (d.getHours())).slice(-2);
        let menit = ("0" + (d.getMinutes())).slice(-2);
        let detik = ("0" + (d.getSeconds())).slice(-2);
        let urut  = jam+menit+detik  
        let nomor = urut+"/Lap/"+bulan_romawi[d.getMonth()]+"/"+year+"/"+unit;
        return nomor;
      }

      static nomor_jurnal(unit){
        const d = new Date();    
        let year = d.getFullYear();    
        let jam = ("0" + (d.getHours())).slice(-2);
        let menit = ("0" + (d.getMinutes())).slice(-2);
        let detik = ("0" + (d.getSeconds())).slice(-2);
        let urut  = jam+menit+detik  
        let nomor = urut+"/Jurnal/"+bulan_romawi[d.getMonth()]+"/"+year+"/"+unit;
        return nomor;
      }

      static sort_datetime_id(tglnya){
        const d = new Date(tglnya);
        let date = ("0" + d.getDate()).slice(-2);
        let month = ("0" + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
        let jam = ("0" + (d.getHours())).slice(-2);
        let menit = ("0" + (d.getMinutes())).slice(-2);
        let detik = ("0" + (d.getSeconds())).slice(-2);
        let tgl = date+"-"+month+"-"+year+" "+jam+":"+menit+":"+detik;
        return tgl;
      }
	static sort_date_en(tglnya){
        const d = new Date(tglnya);
        let date = ("0" + d.getDate()).slice(-2);
        let month = ("0" + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
        let tgl = year+"-"+month+"-"+date;
        return tgl;
      }
      static sort_date_id(tglnya){
        const d = new Date(tglnya);
        let date = ("0" + d.getDate()).slice(-2);
        let month = ("0" + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
        let tgl = date+"-"+month+"-"+ year;
        return tgl;
      }
    static full_date(tglnya){
        const d = new Date(tglnya);
        let date = ("0" + d.getDate()).slice(-2);
        let month = ("0" + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
        let tgl = date+" "+bulan[d.getMonth()] +" "+ year;
        return tgl;
      }
      static full_datetime(tglnya){
        const d = new Date(tglnya);
        let date = ("0" + d.getDate()).slice(-2);
        let month = ("0" + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
        let jam = ("0" + (d.getHours())).slice(-2);
        let menit = ("0" + (d.getMinutes())).slice(-2);
        let detik = ("0" + (d.getSeconds())).slice(-2);
        let tgl = date+" "+bulan[d.getMonth()] +" "+ year+" "+jam+":"+menit+":"+detik;
        return tgl;
      }
      static cek_open(jam_buka,jam_tutup){
        let d   = new Date()
        let hari  = Function.gethari(d)
        let date = ("0" + d.getDate()).slice(-2);
        let month = ("0" + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
       
        let time_buka = year + "-" + month + "-" + date+" "+jam_buka;
        time_buka     = new Date(time_buka).getTime()
        let time_tutup = year + "-" + month + "-" + date+" "+jam_tutup;
        time_tutup     = new Date(time_tutup).getTime()
        let time_sekarang = d.getTime()

     
        let open = 0
     
        if(hari=="Minggu" && (time_sekarang>time_buka && time_sekarang<time_tutup)){
          open    = 1
        }
        return open
      }
      static time(tglnya){
        const d = new Date(tglnya);
        let date = ("0" + d.getDate()).slice(-2);
        let month = ("0" + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
        let jam = ("0" + (d.getHours())).slice(-2);
        let menit = ("0" + (d.getMinutes())).slice(-2);
        let detik = ("0" + (d.getSeconds())).slice(-2);
        let tgl = jam+":"+menit;
        return tgl;
      }
      static generate_id(){ 
        let d   = new Date()
       // let string = d.getTime()+"."+(Math.random() + 1).toString(36).substring(2)
        //let string = crypto.randomBytes(16).toString('hex');
        //return string;
        let randomNumber = Math.floor(Math.random() * 1e9);
        return randomNumber.toString().padStart(9, '0')
      }
    static gethari(tglnya){
        const d = new Date(tglnya);
        let date = ("0" + d.getDate()).slice(-2);
        let month = ("0" + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
        let tgl = year + "-" + month + "-" + date;    
        return hari[d.getDay()];
    }
      
    static getjumlahhari(tglnya){
        const d = new Date(tglnya);   
        let month = d.getMonth() + 1;
        let year = d.getFullYear();
        var dd = new Date(year, month, 0);
        return dd.getDate();
    }      
 
    static get_bulan_id(tglnya){
        const d = new Date(tglnya);
        let date = ("0" + d.getDate()).slice(-2);
        let month = ("0" + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
        let tgl = bulan[d.getMonth()] +" "+ year;
        return tgl;
    }   
       
    static get_bulan_en(tglnya){
        const d = new Date(tglnya);
        let date = ("0" + d.getDate()).slice(-2);
        let month = ("0" + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
        let tgl = year + "-" + month;
        return tgl;
        }
    static get_tahun(tglnya){
        const d = new Date(tglnya);
        let date = ("0" + d.getDate()).slice(-2);
        let month = ("0" + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
        let tgl = year ;
        return tgl;
    }
    static slice(angka,limit){        
        return ("00000" + angka).slice(-limit);
    }
    static tglindex(tglnya){
        const d = new Date(tglnya);
        return d.getDate()
    }
    static urutjurnal(){
      const d = new Date();     
      return d.getTime()
  }
    static number_format(angka){
        return Number(angka).toFixed(2).toLocaleString('us-ID')
    }
    static number_format_id(angka){
      
        return Number(angka).toLocaleString('id-ID')
    }   
    static number_format_uang_id(angka){
      angka   = Number(angka).toFixed(0)
      return Number(angka).toLocaleString('id-ID')
  }
        
}

module.exports = Function

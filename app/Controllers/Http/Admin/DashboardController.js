'use strict'

const Admin          = use('App/Models/Admin')
const Function       = use('App/Helper/Function')
const Env            = use('Env')
const Database       = use('Database')
const fs             = use("fs");


class DashboardController {
	async index({ view, auth ,session,params,request,response}) {
    try {  
       const user    = session.get('session_nama');
       const level   = session.get('session_level');
       const username = session.get('session_username')
      
     
       return view.render('admin.menu',{
        user          : user,
        title         : Env.get('APP_NAME'),
        level         : level,
        label_menu    : "Halaman Utama Admin"
      })

      }catch(err) {
        return view.render('error_404', { error: err })
       }      
  }

  async showDpjb({ view }) {
    return view.render("admin.flter");
  }

  async dpjb({ view, auth ,session,params,request,response}) {
    try {  
       const user    = session.get('session_nama');
       const level   = session.get('session_level');
       const username = session.get('session_username')
       let tgl1        = request.input('startDate')
       let tgl2        = request.input('endDate')
       let jenislayanan   = request.input('jenisLayanan')


       let dpjb = ""
       if(tgl1!=null){
       dpjb     = await Database.raw(`
            SELECT 
                MR.F_CARI_DPJP(A.KD_REGISTRASI) AS dpjp, 
                COUNT(DISTINCT A.KD_REGISTRASI) AS jumlah_pasien
            FROM MR.V_REGISTRASI A 
            LEFT JOIN BILLING.D_TAGIHAN_TARIF_BPJS C ON A.KD_REGISTRASI = C.KD_REGISTRASI
            LEFT JOIN MR.V_PASIEN_INAP B ON A.KD_REGISTRASI = B.KD_REGISTRASI
            JOIN BILLING.D_TAGIHAN D ON A.KD_REGISTRASI = D.KD_REGISTRASI
            WHERE D.TGL_TAGIHAN >= TO_DATE(:tgl1,'YYYY-MM-DD')
              AND D.TGL_TAGIHAN <= TO_DATE(:tgl2,'YYYY-MM-DD')
              AND A.KD_JENIS_PASIEN = :jenislayanan
              AND A.KD_STATUS_PERIKSA NOT IN ('X')
            GROUP BY MR.F_CARI_DPJP(A.KD_REGISTRASI)
            ORDER BY dpjp ASC`,
            {
                tgl1  : tgl1,
                tgl2  : tgl2,
                jenislayanan : jenislayanan
            })
       }
       return view.render('admin.dpjb',{
       user          : user,
       title         : Env.get('APP_NAME'),
       level         : level,
       startDate     : tgl1,
       endDate        : tgl2,
       jenislayanan   : jenislayanan,
       dpjb          : dpjb.rows,
       label_menu    : "Halaman Utama Admin"
      })
    
      }catch(err) {
        return view.render('error_404', { error: err })
       }      
  }

      async filterDpjb({ request, response }) {
        try {
            const { startDate, endDate, jenisLayanan } = request.post();

            let query = `
                SELECT 
                    MR.F_CARI_DPJP(A.KD_REGISTRASI) AS dpjp, 
                    COUNT(DISTINCT A.KD_REGISTRASI) AS jumlah_pasien
                FROM MR.V_REGISTRASI A 
                LEFT JOIN BILLING.D_TAGIHAN_TARIF_BPJS C ON A.KD_REGISTRASI = C.KD_REGISTRASI
                LEFT JOIN MR.V_PASIEN_INAP B ON A.KD_REGISTRASI = B.KD_REGISTRASI
                JOIN BILLING.D_TAGIHAN D ON A.KD_REGISTRASI = D.KD_REGISTRASI
                WHERE D.TGL_TAGIHAN >= TO_DATE(?, 'YYYY-MM-DD')
                  AND D.TGL_TAGIHAN <= TO_DATE(?, 'YYYY-MM-DD')
                  AND A.KD_STATUS_PERIKSA NOT IN ('X')
            `;

            const params = [startDate, endDate];

            if (jenisLayanan != 4) {
                query += ` AND A.KD_JENIS_PASIEN = ? `;
                params.push(jenisLayanan);
            }

            query += ` GROUP BY MR.F_CARI_DPJP(A.KD_REGISTRASI) ORDER BY dpjp ASC `;

            const dpjb = await Database.raw(query, params);

            return response.json({ data: dpjb.rows });

        } catch (err) {
            console.error(err);
            return response.status(500).json({ error: "Terjadi kesalahan saat memfilter data." });
        }
    }


    async dpjbdetail({ view, session, params, request, response }) {
      try {  
          const user = session.get('session_nama');
          const level = session.get('session_level');
          const dpjp = decodeURIComponent(params.dpjp || "");
          const tanggal_awal  = request.get().startDate || "";
          const tanggal_akhir = request.get().endDate || "";
          const jenis_layanan = request.get().jenisLayanan || "4";
          if (!dpjp) {
              throw new Error("DPJP tidak ditemukan");
          }
          
          console.log(`Request Diterima - DPJP: ${dpjp}, Tanggal Awal: ${tanggal_awal}, Tanggal Akhir: ${tanggal_akhir},Jenis Layanan :${jenis_layanan}`); 
          // Eksekusi query
          let dpjbdetail = await Database.raw(`
SELECT * FROM (
    SELECT 
        ROW_NUMBER() OVER (ORDER BY A.NM_PASIEN) AS "NO",
        A.NM_PASIEN AS Nama_Pasien, 
        A.KD_REKAM_MEDIS AS No_RM, 
        SUM(CASE WHEN B.NM_TINDAKAN ILIKE '%visit%' THEN B.QTY ELSE 0 END) AS Qty_Visit,
        TO_CHAR(SUM(CASE WHEN B.NM_TINDAKAN ILIKE '%visit%' THEN B.QTY * B.TARIF ELSE 0 END), 'FM999,999,999') AS Tagihan_Visit,
        SUM(CASE WHEN B.NM_TINDAKAN ILIKE '%konsul%' THEN B.QTY ELSE 0 END) AS Qty_Konsul,
        TO_CHAR(SUM(CASE WHEN B.NM_TINDAKAN ILIKE '%konsul%' THEN B.QTY * B.TARIF ELSE 0 END), 'FM999,999,999') AS Tagihan_Konsul,
        TO_CHAR(SUM(CASE WHEN B.NM_TINDAKAN NOT ILIKE '%visit%' AND B.NM_TINDAKAN NOT ILIKE '%konsul%' AND B.NM_TINDAKAN NOT ILIKE '%sewa%' THEN B.QTY * B.TARIF ELSE 0 END), 'FM999,999,999') AS Tagihan_Tindakan,
        TO_CHAR(SUM(CASE WHEN B.NM_TINDAKAN ILIKE '%sewa%' THEN B.QTY * B.TARIF ELSE 0 END), 'FM999,999,999') AS Tagihan_Sewa_Alat,
        TO_CHAR(SUM(B.QTY * B.TARIF), 'FM999,999,999') AS Total_Jumlah_Diterima
    FROM MR.V_REGISTRASI A 
    JOIN BILLING.D_TAGIHAN D ON A.KD_REGISTRASI = D.KD_REGISTRASI
    JOIN (
        SELECT 
            B.KD_REGISTRASI,
            D.NM_TINDAKAN,
            SUM(E.QTY) AS QTY, 
            SUM(E.TOTAL) AS TOTAL,
            MAX(E.TOTAL / NULLIF(E.QTY, 0)) AS TARIF,
            F.NM_DOKTER
        FROM MR.D_TINDAKAN_PAKET B
        JOIN BILLING.D_TARIK_TAGIHAN_TINDAKAN C ON B.KD_REGISTRASI = C.KD_REGISTRASI
        JOIN BILLING.D_DETAIL_TAGIHAN E ON B.KD_REGISTRASI = E.KD_REGISTRASI AND B.NO_INDEX_TINDAKAN = E.NO_INDEX_REF
        JOIN MR.MD_TINDAKAN_PAKET D ON B.KD_TINDAKAN = D.KD_TINDAKAN
        JOIN MR.D_DOKTER F ON B.NIP_DOKTER = F.NIP_DOKTER
        WHERE 
            CAST(B.TGL_TINDAKAN AS DATE) BETWEEN CAST(:tanggal_awal AS DATE) AND CAST(:tanggal_akhir AS DATE)
            AND F.NM_DOKTER = :dpjp
        GROUP BY B.KD_REGISTRASI, D.NM_TINDAKAN, F.NM_DOKTER
    ) B ON A.KD_REGISTRASI = B.KD_REGISTRASI
    WHERE 
        CAST(D.TGL_TAGIHAN AS DATE) BETWEEN CAST(:tanggal_awal AS DATE) AND CAST(:tanggal_akhir AS DATE)
        AND A.KD_JENIS_PASIEN = :jenis_layanan
        AND B.NM_DOKTER = :dpjp
    GROUP BY A.NM_PASIEN, A.KD_REKAM_MEDIS
    ORDER BY A.NM_PASIEN
) AS sub;

        `, {
            tanggal_awal: tanggal_awal,
            tanggal_akhir: tanggal_akhir,
            dpjp: dpjp,
            jenis_layanan: jenis_layanan
        });
         
          return view.render('admin.dpjbdetail', {
              user,
              title: Env.get('APP_NAME'),
              level, dpjp,
              tanggal_awal: tanggal_awal,
              tanggal_akhir: tanggal_akhir,
              dpjbdetail: dpjbdetail.rows,
              
              total_rawat_jalan: dpjbdetail.rows.reduce((sum, row) => sum + row.total_tagihan_rawat_jalan, 0),
              total_rawat_inap: dpjbdetail.rows.reduce((sum, row) => sum + row.total_tagihan_rawat_inap, 0),
              total_sewa_alat: dpjbdetail.rows.reduce((sum, row) => sum + row.total_tagihan_sewa_alat, 0),
              total_keseluruhan: dpjbdetail.rows.reduce((sum, row) => sum + row.total_keseluruhan_tagihan, 0),
              label_menu: "Detail DPJP"
          });
  
      } catch (err) {
          console.error("🔥 Error di dpjbdetail:", err.message);
          return view.render('error_404', { error: err.message });
      }      
  }
  


  async dokter({ view, auth ,session,params,request,response}) {
    try {  
       const user    = session.get('session_nama');
       const level   = session.get('session_level');
       const username = session.get('session_username')
       let dokter     = await Database.raw("SELECT nip_dokter,nm_dokter,jenis_kelamin,a.kd_spesialis,b.nm_spesialis from mr.d_dokter a "
                        +" join mr.md_spesialis b on a.kd_spesialis=b.kd_spesialis where a.status='A' order by nm_dokter asc")
    
       return view.render('admin.dokter',{
        user          : user,
        title         : Env.get('APP_NAME'),
        level         : level,
        dokter        : dokter.rows,
        label_menu    : "Halaman Utama Admin"
      })

      }catch(err) {
        return view.render('error_404', { error: err })
       }      
  }

  async pending({ view, auth ,session,params,request,response}) {
    try {  
       const user    = session.get('session_nama');
       const level   = session.get('session_level');
       const username = session.get('session_username')
      
     
       return view.render('admin.pending',{
        user          : user,
        title         : Env.get('APP_NAME'),
        level         : level,
        label_menu    : "Halaman Utama Admin"
      })

      }catch(err) {
        return view.render('error_404', { error: err })
       }      
  }
}
     

module.exports = DashboardController

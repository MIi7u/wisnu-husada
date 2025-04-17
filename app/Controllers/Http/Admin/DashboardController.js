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
    
  
    async dpjbdetailrincian({ view, session, params, request, response }) 
    {
        try {
            const startDate   = request.input('startDate')|| null;
            const endDate     = request.input('endDate')|| null;
            const nip_dokter    = request.input('nip_dokter')|| null;
            const [dpjbdetail,rincian,prj,igd] = await Promise.all(
            [ 

                Database.raw(`
                    SELECT nip_dokter, 
                        nm_dokter, 
                        jenis_kelamin, 
                        a.kd_spesialis, 
                        b.nm_spesialis
                    FROM mr.d_dokter a 
                    JOIN mr.md_spesialis b ON a.kd_spesialis = b.kd_spesialis 
                    WHERE a.status = 'A' 
                    ORDER BY nm_dokter ASC
                `),
                
                Database.raw( `
                SELECT 
                    TO_CHAR(J.TGL_REGISTRASI, 'DD Month YYYY') AS TGL_REGISTRASI, 
                    B.KD_REGISTRASI, 
                    J.NM_PASIEN, 

                    STRING_AGG(
                        CASE 
                        WHEN D.KD_TINDAKAN = '3002' THEN 'JASA PEMERIKSAAN' 
                        ELSE D.NM_TINDAKAN 
                        END, 
                        ', '
                    ) AS NM_TINDAKAN, 
                    
                    -- Kolom Jasa Tindakan
                    MAX(
                        CASE 
                        WHEN D.KD_TINDAKAN = '3002' THEN 50000 
                        ELSE 0 
                        END
                    ) AS JASA_PEMERIKSAAN,

                    J.KD_PEMBAYARAN, 
                    J.NM_PEMBAYARAN, 
                   ROUND(L.TARIF_BPJS * 0.2, 0) AS TARIF_BPJS_20,

                    ROUND(SUM(
                    CASE
                        WHEN (D.KD_TINDAKAN = '3002') AND (J.KD_PEMBAYARAN IN ('A06', 'A07')) THEN 50000
                        WHEN J.KD_PEMBAYARAN IN ('A06', 'A07') THEN (L.TARIF_BPJS * 0.2)
                        ELSE E.TOTAL
                    END
                       ), 0) AS TOTAL_TARIF

                    FROM 
                    MR.D_TINDAKAN_PAKET B 
                    LEFT JOIN MR.D_PERAWAT G ON B.NIP_PERAWAT = G.NIP_PERAWAT,
                    BILLING.D_TARIK_TAGIHAN_TINDAKAN C,
                    MR.MD_TINDAKAN_PAKET D,
                    BILLING.D_DETAIL_TAGIHAN E,
                    MR.D_DOKTER F,
                    MR.V_REGISTRASI J 
                        LEFT JOIN BILLING.D_TAGIHAN_TARIF_BPJS L ON J.KD_REGISTRASI = L.KD_REGISTRASI,
                    MR.MD_GROUP_TAGIHAN_BPJS K 

                    WHERE 
                    B.KD_REGISTRASI = J.KD_REGISTRASI 
                    AND D.KD_GROUP_TAGIHAN = K.KD_GROUP_TAGIHAN
                    AND B.KD_REGISTRASI = C.KD_REGISTRASI
                    AND B.NO_INDEX_TINDAKAN = C.INDEX_TINDAKAN
                    AND B.KD_REGISTRASI = E.KD_REGISTRASI
                    AND B.KD_TINDAKAN = D.KD_TINDAKAN
                    AND B.NO_INDEX_TINDAKAN = E.NO_INDEX_REF
                    AND DATE(B.TGL_TINDAKAN) >= TO_DATE(:startDate,'YYYY/MM/DD')
                    AND DATE(B.TGL_TINDAKAN) <= TO_DATE(:endDate,'YYYY/MM/DD')
                    AND B.NIP_DOKTER = F.NIP_DOKTER
                    AND D.KD_GROUP_TAGIHAN IN ('12','7','13','1','6','11')
                    AND F.NIP_DOKTER = :nip_dokter
                    AND J.KD_JENIS_PASIEN = '1' -- rawat jalan

                    GROUP BY 
                    J.TGL_REGISTRASI, 
                    B.KD_REGISTRASI, 
                    J.NM_PASIEN, 
                    J.KD_PEMBAYARAN, 
                    J.NM_PEMBAYARAN, 
                    L.TARIF_BPJS

                    ORDER BY 
                    J.KD_PEMBAYARAN, 
                    J.NM_PASIEN ASC;

                `, {
                    startDate: startDate,
                    endDate: endDate,
                    nip_dokter: nip_dokter
                  }),
             

                Database.raw(`    
             SELECT   
    INACBG.KD_REGISTRASI AS KD_REGISTRASI,
    TO_CHAR(A.TGL_REGISTRASI, 'DD Mon YYYY') AS TGL_REGISTRASI,
    TO_CHAR(A.TGL_KELUAR, 'DD Mon YYYY') AS TGL_KELUAR,
    A.NM_PASIEN AS NM_PASIEN,  
    MIN(A.KD_REKAM_MEDIS) AS NO_RM,  
    STRING_AGG(B.KD_TINDAKAN || ' - ' || D.NM_TINDAKAN, ', ') AS NM_TINDAKAN,  
    STRING_AGG(TO_CHAR(B.TGL_TINDAKAN, 'DD Mon YYYY'), ', ') AS TGL_TINDAKAN_LIST,

    SUM(CASE  
        WHEN B.KD_TINDAKAN IN ('2068','2065','2066','2067')  
        THEN E.QTY  
        ELSE 0  
    END) AS QTY_VISIT,  

    CASE 
        WHEN F.KD_SPESIALIS = 'S0015' THEN 0 
        ELSE ROUND(SUM(
            CASE  
                WHEN B.KD_TINDAKAN IN ('2068','2065','2066','2067')  
                THEN E.QTY * 
                    CASE 
                        WHEN F.KD_SPESIALIS = 'S0015' THEN 25000
                        ELSE 50000
                    END
                ELSE 0  
            END
        ), 0)
    END AS TAGIHAN_VISIT,

    SUM(CASE  
        WHEN B.KD_TINDAKAN IN ('2007','2008','2009','2010','2060','2061')  
        THEN E.QTY  
        ELSE 0  
    END) AS QTY_KONSUL,  

    CASE 
        WHEN F.KD_SPESIALIS = 'S0015' THEN 0
        ELSE ROUND(SUM(
            CASE  
                WHEN B.KD_TINDAKAN IN ('2007','2008','2009','2010','2060','2061')  
                THEN E.QTY * 50000 
                ELSE 0  
            END
        ), 0)
    END AS TAGIHAN_KONSUL,

    SUM(CASE  
        WHEN B.KD_TINDAKAN NOT IN ('2068','2065','2066','2067',
                                '2007','2008','2009','2010','2060','2061','2058', '2059')  
        THEN E.QTY  
        ELSE 0  
    END) AS QTY_TINDAKAN,  

    ROUND(SUM(
        CASE  
            WHEN B.KD_TINDAKAN NOT IN ('2068','2065','2066','2067',
                                    '2007','2008','2009','2010','2060','2061', '2058', '2059')  
            THEN E.TOTAL  
            ELSE 0  
        END
    )*0.85, 0) AS TAGIHAN_TINDAKAN,

    CASE 
        WHEN SUM(CASE WHEN B.KD_TINDAKAN IN ('2058', '2059') THEN 1 ELSE 0 END) > 0 
        THEN ROUND(COALESCE(INACBG.TARIF_BPJS, 0) * 0.025, 0)
        ELSE 0
    END AS TAGIHAN_SEWA_ALAT,

    CASE 
        WHEN F.KD_SPESIALIS = 'S0015' THEN 0
        ELSE COALESCE(INACBG.TARIF_BPJS, 0)
    END AS TARIF_INACBG,

    F.KD_SPESIALIS,

    CASE 
        WHEN F.KD_SPESIALIS = 'S0015' THEN 25000
        ELSE
            ROUND(
                (
                    ROUND(SUM(
                        CASE  
                            WHEN B.KD_TINDAKAN IN ('2068','2065','2066','2067')  
                            THEN E.QTY * 
                                CASE 
                                    WHEN F.KD_SPESIALIS = 'S0015' THEN 25000
                                    ELSE 50000
                                END
                            ELSE 0  
                        END
                    ), 0) + 
                    ROUND(SUM(
                        CASE  
                            WHEN B.KD_TINDAKAN IN ('2007','2008','2009','2010','2060','2061')  
                            THEN E.QTY * 50000 
                            ELSE 0  
                        END
                    ), 0) +
                    CASE 
                        WHEN SUM(CASE WHEN B.KD_TINDAKAN IN ('2058', '2059') THEN 1 ELSE 0 END) > 0 
                        THEN ROUND(COALESCE(INACBG.TARIF_BPJS, 0) * 0.025, 0)
                        ELSE 0
                    END
                ) 
                + 
                ROUND(
                    CASE 
                        WHEN F.KD_SPESIALIS = 'S008' THEN COALESCE(INACBG.TARIF_BPJS, 0) * 0.10
                        WHEN F.KD_SPESIALIS = 'S0011' THEN COALESCE(INACBG.TARIF_BPJS, 0) * 0.05
                        WHEN F.KD_SPESIALIS = 'S0015' THEN COALESCE(INACBG.TARIF_BPJS, 0) * 0.03
                        ELSE COALESCE(INACBG.TARIF_BPJS, 0) * 0.20
                    END, 0)
            , 0)
    END AS TOTAL_SEMUA

FROM MR.D_TINDAKAN_PAKET B  
LEFT JOIN MR.D_PERAWAT G ON B.NIP_PERAWAT = G.NIP_PERAWAT  
JOIN BILLING.D_TARIK_TAGIHAN_TINDAKAN C ON B.KD_REGISTRASI = C.KD_REGISTRASI AND B.NO_INDEX_TINDAKAN = C.INDEX_TINDAKAN  
JOIN MR.MD_TINDAKAN_PAKET D ON B.KD_TINDAKAN = D.KD_TINDAKAN  
JOIN BILLING.D_DETAIL_TAGIHAN E ON B.KD_REGISTRASI = E.KD_REGISTRASI AND B.NO_INDEX_TINDAKAN = E.NO_INDEX_REF  
JOIN MR.D_DOKTER F ON B.NIP_DOKTER = F.NIP_DOKTER  
JOIN MR.V_REGISTRASI A ON B.KD_REGISTRASI = A.KD_REGISTRASI  
JOIN BILLING.D_TAGIHAN_TARIF_BPJS INACBG ON A.KD_REGISTRASI = INACBG.KD_REGISTRASI

WHERE 
    A.TGL_KELUAR IS NOT NULL AND
    A.TGL_KELUAR BETWEEN TO_DATE(:startDate,'YYYY/MM/DD') AND TO_DATE(:endDate,'YYYY/MM/DD') AND
    D.KD_GROUP_TAGIHAN IN ('12','7','13','1','6','11') AND
    A.KD_JENIS_PASIEN = '2' AND
    F.NIP_DOKTER = :nip_dokter

GROUP BY 
    INACBG.KD_REGISTRASI,
    A.TGL_REGISTRASI,
    A.TGL_KELUAR,
    A.NM_PASIEN, 
    INACBG.TARIF_BPJS, 
    F.KD_SPESIALIS
ORDER BY A.NM_PASIEN ASC;


                `, {
                    startDate: startDate,
                    endDate: endDate,
                    nip_dokter: nip_dokter
                  }),
                    

            Database.raw( `
                SELECT 
                    TO_CHAR(J.TGL_REGISTRASI, 'DD Month YYYY') AS TGL_REGISTRASI, 
                    B.KD_REGISTRASI, 
                    J.NM_PASIEN, 

                    STRING_AGG(
                        CASE 
                        WHEN D.KD_TINDAKAN = '3002' THEN 'JASA PEMERIKSAAN' 
                        ELSE D.NM_TINDAKAN 
                        END, 
                        ', '
                    ) AS NM_TINDAKAN, 
                    
                    -- Kolom Jasa Tindakan
                    MAX(
                        CASE 
                        WHEN D.KD_TINDAKAN = '3002' THEN 50000 
                        ELSE 0 
                        END
                    ) AS JASA_PEMERIKSAAN,

                    J.KD_PEMBAYARAN, 
                    J.NM_PEMBAYARAN, 
                   ROUND(L.TARIF_BPJS * 0.2, 0) AS TARIF_BPJS_20,

                    ROUND(SUM(
                    CASE
                        WHEN (D.KD_TINDAKAN = '3002') AND (J.KD_PEMBAYARAN IN ('A06', 'A07')) THEN 50000
                        WHEN J.KD_PEMBAYARAN IN ('A06', 'A07') THEN (L.TARIF_BPJS * 0.2)
                        ELSE E.TOTAL
                    END
                       ), 0) AS TOTAL_TARIF

                    FROM 
                    MR.D_TINDAKAN_PAKET B 
                    LEFT JOIN MR.D_PERAWAT G ON B.NIP_PERAWAT = G.NIP_PERAWAT,
                    BILLING.D_TARIK_TAGIHAN_TINDAKAN C,
                    MR.MD_TINDAKAN_PAKET D,
                    BILLING.D_DETAIL_TAGIHAN E,
                    MR.D_DOKTER F,
                    MR.V_REGISTRASI J 
                        LEFT JOIN BILLING.D_TAGIHAN_TARIF_BPJS L ON J.KD_REGISTRASI = L.KD_REGISTRASI,
                    MR.MD_GROUP_TAGIHAN_BPJS K 

                    WHERE 
                    B.KD_REGISTRASI = J.KD_REGISTRASI 
                    AND D.KD_GROUP_TAGIHAN = K.KD_GROUP_TAGIHAN
                    AND B.KD_REGISTRASI = C.KD_REGISTRASI
                    AND B.NO_INDEX_TINDAKAN = C.INDEX_TINDAKAN
                    AND B.KD_REGISTRASI = E.KD_REGISTRASI
                    AND B.KD_TINDAKAN = D.KD_TINDAKAN
                    AND B.NO_INDEX_TINDAKAN = E.NO_INDEX_REF
                    AND DATE(B.TGL_TINDAKAN) >= TO_DATE(:startDate,'YYYY/MM/DD')
                    AND DATE(B.TGL_TINDAKAN) <= TO_DATE(:endDate,'YYYY/MM/DD')
                    AND B.NIP_DOKTER = F.NIP_DOKTER
                    AND D.KD_GROUP_TAGIHAN IN ('12','7','13','1','6','11')
                    AND F.NIP_DOKTER = :nip_dokter
                    AND J.KD_JENIS_PASIEN = '3' -- IGD

                    GROUP BY 
                    J.TGL_REGISTRASI, 
                    B.KD_REGISTRASI, 
                    J.NM_PASIEN, 
                    J.KD_PEMBAYARAN, 
                    J.NM_PEMBAYARAN, 
                    L.TARIF_BPJS

                    ORDER BY 
                    J.KD_PEMBAYARAN, 
                    J.NM_PASIEN ASC;

                `, {
                    startDate: startDate,
                    endDate: endDate,
                    nip_dokter: nip_dokter
                  })
                ])
         
            return view.render('admin.rincian', {
               
                dpjbdetail: dpjbdetail.rows, // Data dokter dan spesialis
                rincian: rincian.rows,   
                prj:prj.rows ,
                igd:igd.rows,
                startDate:startDate,
                endDate:endDate,
                nip_dokter:nip_dokter
                
            });

        } catch (err) {
            console.error("Error di Controller dpjbdetail:", err.message);
            return view.render('error_404', { error: err.message });
        }
    }
        
async dokter({ view }) 
{
        return view.render('admin.dokter')
      }
    // Route: GET /admin/dokter/data
async dokterData({ response }) {
    try {
      let dokter = await Database.raw(`
        SELECT nip_dokter, nm_dokter, jenis_kelamin, a.kd_spesialis, b.nm_spesialis
        FROM mr.d_dokter a
        JOIN mr.md_spesialis b ON a.kd_spesialis = b.kd_spesialis
        WHERE a.status = 'A'
        ORDER BY nm_dokter ASC
      `);
      return response.json({ data: dokter.rows });
    } catch (err)
    {
      console.error("Error di Controler Dokter:", err.message);
      return response.status(500).json({ error: 'Gagal ambil data dokter' });
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
  module.exports = DashboardController;

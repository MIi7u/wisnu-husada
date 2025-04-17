SELECT 
    A.KD_REGISTRASI,
    A.NM_STATUS_PERIKSA, 
    A.NM_PASIEN,

    -- Mengambil tindakan utama
    COALESCE((
        SELECT STRING_AGG(DISTINCT D.NM_TINDAKAN, ', ') 
        FROM MR.D_TINDAKAN_PAKET B 
        JOIN MR.MD_TINDAKAN_PAKET D ON B.KD_TINDAKAN = D.KD_TINDAKAN 
        WHERE B.KD_REGISTRASI = A.KD_REGISTRASI 
        AND B.KD_TINDAKAN IN ('2068','2065','2066','2067','2014','2011','2012','2013')
    ), '') AS TINDAKAN_VISIT,

    -- Menghitung total qty tindakan utama
    COALESCE((
        SELECT SUM(E.QTY) 
        FROM BILLING.D_DETAIL_TAGIHAN E
        JOIN MR.D_TINDAKAN_PAKET B ON E.NO_INDEX_REF = B.NO_INDEX_TINDAKAN
        WHERE B.KD_REGISTRASI = A.KD_REGISTRASI
        AND B.KD_TINDAKAN IN ('2068','2065','2066','2067','2014','2011','2012','2013')
    ), 0) AS TOTAL_QTY,

    -- Menghitung total tagihan tindakan utama
    COALESCE((
        SELECT SUM(E.TOTAL) 
        FROM BILLING.D_DETAIL_TAGIHAN E
        JOIN MR.D_TINDAKAN_PAKET B ON E.NO_INDEX_REF = B.NO_INDEX_TINDAKAN
        WHERE B.KD_REGISTRASI = A.KD_REGISTRASI
        AND B.KD_TINDAKAN IN ('2068','2065','2066','2067','2014','2011','2012','2013')
    ), 0) AS TOTAL_TAGIHAN,

    -- Mengambil tindakan konsultasi
    COALESCE((
        SELECT STRING_AGG(DISTINCT D.NM_TINDAKAN, ', ') 
        FROM MR.D_TINDAKAN_PAKET B 
        JOIN MR.MD_TINDAKAN_PAKET D ON B.KD_TINDAKAN = D.KD_TINDAKAN 
        WHERE B.KD_REGISTRASI = A.KD_REGISTRASI 
        AND B.KD_TINDAKAN IN ('1008','2007','2008','2009','2060','2061','2089','3010','3021','3022','3093')
    ), '') AS KONSUL,

    -- Menghitung total qty konsultasi
    COALESCE((
        SELECT SUM(E.QTY) 
        FROM BILLING.D_DETAIL_TAGIHAN E
        JOIN MR.D_TINDAKAN_PAKET B ON E.NO_INDEX_REF = B.NO_INDEX_TINDAKAN
        WHERE B.KD_REGISTRASI = A.KD_REGISTRASI
        AND B.KD_TINDAKAN IN ('1008','2007','2008','2009','2060','2061','2089','3010','3021','3022','3093')
    ), 0) AS TOTAL_QTY_KONSUL,

    -- Menghitung total tagihan konsultasi
    COALESCE((
        SELECT SUM(E.TOTAL) 
        FROM BILLING.D_DETAIL_TAGIHAN E
        JOIN MR.D_TINDAKAN_PAKET B ON E.NO_INDEX_REF = B.NO_INDEX_TINDAKAN
        WHERE B.KD_REGISTRASI = A.KD_REGISTRASI
        AND B.KD_TINDAKAN IN ('1008','2007','2008','2009','2060','2061','2089','3010','3021','3022','3093')
    ), 0) AS TOTAL_TAGIHAN_KONSUL

FROM MR.V_REGISTRASI A
WHERE EXISTS (
    SELECT 1 FROM BILLING.D_DETAIL_TAGIHAN 
    WHERE KD_REGISTRASI = A.KD_REGISTRASI 
    AND NIP_DOKTER = 'D0000051'
)
AND A.TGL_REGISTRASI BETWEEN TO_DATE('01/01/2025','DD/MM/YYYY') 
                         AND TO_DATE('31/01/2025','DD/MM/YYYY')
AND A.KD_JENIS_PASIEN = '2'
AND A.KD_STATUS_PERIKSA NOT IN ('X')   
ORDER BY A.KD_REGISTRASI ASC


query lain....

WITH 
TINDAKAN AS (
    SELECT 
        B.KD_REGISTRASI, 
        COALESCE(STRING_AGG(DISTINCT D.NM_TINDAKAN, ', '), '') AS TINDAKAN_DITERIMA
    FROM MR.D_TINDAKAN_PAKET B
    JOIN MR.MD_TINDAKAN_PAKET D ON B.KD_TINDAKAN = D.KD_TINDAKAN 
    WHERE B.KD_TINDAKAN IN ('2068','2065','2066','2067','2014','2011','2012','2013') -- Tindakan utama
    GROUP BY B.KD_REGISTRASI
),
QTY AS (
    SELECT 
        E.KD_REGISTRASI, 
        COALESCE(SUM(E.QTY), 0) AS TOTAL_QTY
    FROM BILLING.D_DETAIL_TAGIHAN E
    JOIN MR.D_TINDAKAN_PAKET B ON E.NO_INDEX_REF = B.NO_INDEX_TINDAKAN
    WHERE B.KD_TINDAKAN IN ('2068','2065','2066','2067','2014','2011','2012','2013')
    GROUP BY E.KD_REGISTRASI
),
TAGIHAN AS (
    SELECT 
        E.KD_REGISTRASI,
        COALESCE(SUM(E.TOTAL), 0) AS TOTAL_TAGIHAN
    FROM BILLING.D_DETAIL_TAGIHAN E
    JOIN MR.D_TINDAKAN_PAKET B ON E.NO_INDEX_REF = B.NO_INDEX_TINDAKAN
    WHERE B.KD_TINDAKAN IN ('2068','2065','2066','2067','2014','2011','2012','2013')  
    GROUP BY E.KD_REGISTRASI
),
KONSUL AS (
    SELECT 
        B.KD_REGISTRASI, 
        COALESCE(STRING_AGG(DISTINCT D.NM_TINDAKAN, ', '), '') AS KONSUL
    FROM MR.D_TINDAKAN_PAKET B
    JOIN MR.MD_TINDAKAN_PAKET D ON B.KD_TINDAKAN = D.KD_TINDAKAN 
    WHERE B.KD_TINDAKAN IN ('1008','2007','2008','2009','2060','2061','2089','3010','3021','3022','3093') -- Tindakan konsultasi
    GROUP BY B.KD_REGISTRASI
),
QTY_KONSUL AS (
    SELECT 
        E.KD_REGISTRASI, 
        COALESCE(SUM(E.QTY), 0) AS TOTAL_QTY_KONSUL
    FROM BILLING.D_DETAIL_TAGIHAN E
    JOIN MR.D_TINDAKAN_PAKET B ON E.NO_INDEX_REF = B.NO_INDEX_TINDAKAN
    WHERE B.KD_TINDAKAN IN ('1008','2007','2008','2009','2060','2061','2089','3010','3021','3022','3093')
    GROUP BY E.KD_REGISTRASI
),
TAGIHAN_KONSUL AS (
    SELECT 
        E.KD_REGISTRASI,
        COALESCE(SUM(E.TOTAL), 0) AS TOTAL_TAGIHAN_KONSUL
    FROM BILLING.D_DETAIL_TAGIHAN E
    JOIN MR.D_TINDAKAN_PAKET B ON E.NO_INDEX_REF = B.NO_INDEX_TINDAKAN
    WHERE B.KD_TINDAKAN IN ('1008','2007','2008','2009','2060','2061','2089','3010','3021','3022','3093')  
    GROUP BY E.KD_REGISTRASI
),
TAGIHAN_UMUM AS (
    SELECT 
        E.KD_REGISTRASI,
        COALESCE(SUM(E.TOTAL), 0) AS TOTAL_TAGIHAN_UMUM
    FROM BILLING.D_DETAIL_TAGIHAN E
    JOIN MR.D_TINDAKAN_PAKET B ON E.NO_INDEX_REF = B.NO_INDEX_TINDAKAN
    WHERE B.KD_TINDAKAN NOT IN ('2068','2065','2066','2067','2014','2011','2012','2013',
                                '1008','2007','2008','2009','2060','2061','2089','3010','3021','3022','3093')  
    GROUP BY E.KD_REGISTRASI
)

SELECT 
    A.KD_REGISTRASI,
    A.NM_STATUS_PERIKSA, 
    A.NM_PASIEN,
    COALESCE(T.TINDAKAN_DITERIMA, '') AS TINDAKAN_VISIT,
    COALESCE(Q.TOTAL_QTY, 0) AS QTY_VISIT,
    COALESCE(TG.TOTAL_TAGIHAN, 0) AS TOTAL_TAGIHAN,
    COALESCE(K.KONSUL, '') AS KONSUL,
    COALESCE(QK.TOTAL_QTY_KONSUL, 0) AS QTY_KONSUL,
    COALESCE(TGK.TOTAL_TAGIHAN_KONSUL, 0) AS TOTAL_TAGIHAN_KONSUL,
    COALESCE(TGU.TOTAL_TAGIHAN_UMUM, 0) AS TOTAL_TAGIHAN_UMUM
FROM MR.V_REGISTRASI A
LEFT JOIN TINDAKAN T ON A.KD_REGISTRASI = T.KD_REGISTRASI
LEFT JOIN QTY Q ON A.KD_REGISTRASI = Q.KD_REGISTRASI
LEFT JOIN TAGIHAN TG ON A.KD_REGISTRASI = TG.KD_REGISTRASI
LEFT JOIN KONSUL K ON A.KD_REGISTRASI = K.KD_REGISTRASI
LEFT JOIN QTY_KONSUL QK ON A.KD_REGISTRASI = QK.KD_REGISTRASI
LEFT JOIN TAGIHAN_KONSUL TGK ON A.KD_REGISTRASI = TGK.KD_REGISTRASI
LEFT JOIN TAGIHAN_UMUM TGU ON A.KD_REGISTRASI = TGU.KD_REGISTRASI
WHERE EXISTS (
    SELECT 1 
    FROM MR.D_TINDAKAN_PAKET B
    WHERE B.KD_REGISTRASI = A.KD_REGISTRASI
    AND B.NIP_DOKTER = 'D0000051'
)
AND DATE(A.TGL_REGISTRASI) BETWEEN TO_DATE('01/01/2025','DD/MM/YYYY') 
                               AND TO_DATE('31/01/2025','DD/MM/YYYY')
AND A.KD_JENIS_PASIEN = '2' 
AND A.KD_STATUS_PERIKSA NOT IN ('X')   
ORDER BY A.KD_REGISTRASI ASC
LIMIT 100;


tanggal 29 Maret 2025
async dpjbdetail({ view, session, params, request, response }) {
      try {  
          const user = session.get('session_nama');
          const level = session.get('session_level');
          const dpjp = decodeURIComponent(params.dpjp || "");
          const tanggal_awal  = request.get().startDate || "";
          const tanggal_akhir = request.get().endDate || "";
          const nip_dokter = request.get().nip_dokter|| "";
          if (!dpjp) {
              throw new Error("DPJP tidak ditemukan");
          }
          
          console.log(`Request Diterima - DPJP: ${dpjp}, Tanggal Awal: ${tanggal_awal}, Tanggal Akhir: ${tanggal_akhir}`); 
          // Eksekusi query
          let dpjbdetail = await Database.raw(`
                    WITH TINDAKAN AS (
                SELECT 
                    B.KD_REGISTRASI, 
                    STRING_AGG(DISTINCT D.NM_TINDAKAN, ', ') AS TINDAKAN_DITERIMA
                FROM MR.D_TINDAKAN_PAKET B
                JOIN MR.MD_TINDAKAN_PAKET D ON B.KD_TINDAKAN = D.KD_TINDAKAN
                WHERE B.KD_TINDAKAN IN ('2068','2065','2066','2067','2014','2011','2012','2013') 
                GROUP BY B.KD_REGISTRASI
            ),
            KONSUL AS (
                SELECT 
                    B.KD_REGISTRASI, 
                    STRING_AGG(DISTINCT D.NM_TINDAKAN, ', ') AS KONSUL
                FROM MR.D_TINDAKAN_PAKET B
                JOIN MR.MD_TINDAKAN_PAKET D ON B.KD_TINDAKAN = D.KD_TINDAKAN
                WHERE B.KD_TINDAKAN IN ('1008','2007','2008','2009','2060','2061','2089','3010','3021','3022','3093') 
                GROUP BY B.KD_REGISTRASI
            ),
            BILLING_SUM AS (
                SELECT 
                    E.KD_REGISTRASI,
                    SUM(E.QTY) FILTER (WHERE B.KD_TINDAKAN IN ('2068','2065','2066','2067','2014','2011','2012','2013')) AS TOTAL_QTY,
                    SUM(E.TOTAL) FILTER (WHERE B.KD_TINDAKAN IN ('2068','2065','2066','2067','2014','2011','2012','2013')) AS TOTAL_TAGIHAN,
                    SUM(E.QTY) FILTER (WHERE B.KD_TINDAKAN IN ('1008','2007','2008','2009','2060','2061','2089','3010','3021','3022','3093')) AS TOTAL_QTY_KONSUL,
                    SUM(E.TOTAL) FILTER (WHERE B.KD_TINDAKAN IN ('1008','2007','2008','2009','2060','2061','2089','3010','3021','3022','3093')) AS TOTAL_TAGIHAN_KONSUL,
                    SUM(E.TOTAL) FILTER (WHERE B.KD_TINDAKAN NOT IN ('2068','2065','2066','2067','2014','2011','2012','2013',
                                                                    '1008','2007','2008','2009','2060','2061','2089','3010','3021','3022','3093')) AS TOTAL_TAGIHAN_UMUM,
                    SUM(E.TOTAL) FILTER (WHERE B.KD_TINDAKAN IN ('kode_sewa_alat1', 'kode_sewa_alat2')) AS TAGIHAN_SEWA_ALAT,
                    SUM(E.TOTAL) AS TOTAL_JUMLAH_DITERIMA
                FROM BILLING.D_DETAIL_TAGIHAN E
                JOIN MR.D_TINDAKAN_PAKET B ON E.NO_INDEX_REF = B.NO_INDEX_TINDAKAN
                GROUP BY E.KD_REGISTRASI
            )
            SELECT 
                A.KD_REGISTRASI,
                A.NM_STATUS_PERIKSA, 
                A.KD_REKAM_MEDIS AS NO_RM,
                A.NM_PASIEN AS NM_PASIEN,
                COALESCE(T.TINDAKAN_DITERIMA, '') AS TINDAKAN_VISIT,
                COALESCE(BS.TOTAL_QTY, 0) AS QTY_VISIT,
                COALESCE(BS.TOTAL_TAGIHAN, 0) AS TAGIHAN_VISIT,
                COALESCE(K.KONSUL, '') AS KONSUL,
                COALESCE(BS.TOTAL_QTY_KONSUL, 0) AS QTY_KONSUL,
                COALESCE(BS.TOTAL_TAGIHAN_KONSUL, 0) AS TOTAL_TAGIHAN_KONSUL,
                COALESCE(BS.TOTAL_TAGIHAN_UMUM, 0) AS TOTAL_TAGIHAN_UMUM,
                COALESCE(BS.TAGIHAN_SEWA_ALAT, 0) AS TAGIHAN_SEWA_ALAT,
                COALESCE(BS.TOTAL_JUMLAH_DITERIMA, 0) AS TOTAL_JUMLAH_DITERIMA
            FROM MR.V_REGISTRASI A
            LEFT JOIN TINDAKAN T ON A.KD_REGISTRASI = T.KD_REGISTRASI
            LEFT JOIN KONSUL K ON A.KD_REGISTRASI = K.KD_REGISTRASI
            LEFT JOIN BILLING_SUM BS ON A.KD_REGISTRASI = BS.KD_REGISTRASI
            WHERE EXISTS (
                SELECT 1 
                FROM MR.D_TINDAKAN_PAKET B
                WHERE B.KD_REGISTRASI = A.KD_REGISTRASI
                AND B.NIP_DOKTER = :nip_dokter
            )
            AND DATE(A.TGL_REGISTRASI) BETWEEN TO_DATE(:tanggal_awal,'YYYY/MM/DD') 
                                            AND TO_DATE(:tanggal_akhir,'YYYY/MM/DD')
            AND A.KD_JENIS_PASIEN = '2' 
            AND A.KD_STATUS_PERIKSA NOT IN ('X')   
            ORDER BY A.KD_REGISTRASI ASC;


        `, {
            tanggal_awal: tanggal_awal,
            tanggal_akhir: tanggal_akhir,
            nip_dokter : nip_dokter,
            
        });
         
          return view.render('admin.dpjbdetail', {
              user,
              title: Env.get('APP_NAME'),
              level, dpjp,
              tanggal_awal: tanggal_awal,
              tanggal_akhir: tanggal_akhir,
              dpjbdetail: dpjbdetail.rows,
              nip_dokter : nip_dokter,
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

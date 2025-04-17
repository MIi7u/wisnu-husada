SELECT   
                INACBG.KD_REGISTRASI AS KD_REGISTRASI,
                TO_CHAR(A.TGL_REGISTRASI, 'DD Mon YYYY') AS TGL_REGISTRASI,
                A.NM_PASIEN AS NM_PASIEN,  
                MIN(A.KD_REKAM_MEDIS) AS NO_RM,  
                STRING_AGG(B.KD_TINDAKAN || ' - ' || D.NM_TINDAKAN, ', ') AS NM_TINDAKAN,  
                STRING_AGG(TO_CHAR(B.TGL_TINDAKAN, 'DD Mon YYYY'), ', ') AS TGL_TINDAKAN_LIST,

                SUM(CASE  
                    WHEN B.KD_TINDAKAN IN ('2068','2065','2066','2067')  
                    THEN E.QTY  
                    ELSE 0  
                END) AS QTY_VISIT,  

                ROUND(SUM(
                    CASE  
                        WHEN B.KD_TINDAKAN IN ('2068','2065','2066','2067')  
                        THEN E.QTY * 50000 
                        ELSE 0  
                    END
                ), 0) AS TAGIHAN_VISIT,

                SUM(CASE  
                    WHEN B.KD_TINDAKAN IN ('2007','2008','2009','2010','2060','2061')  
                    THEN E.QTY  
                    ELSE 0  
                END) AS QTY_KONSUL,  

                ROUND(SUM(
                    CASE  
                        WHEN B.KD_TINDAKAN IN ('2007','2008','2009','2010','2060','2061')  
                        THEN E.QTY * 50000 
                        ELSE 0  
                    END
                ), 0) AS TAGIHAN_KONSUL,

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

                COALESCE(INACBG.TARIF_BPJS, 0) AS TARIF_INACBG,
                F.KD_SPESIALIS,

                ROUND(
                    (
                        ROUND(SUM(
                            CASE  
                                WHEN B.KD_TINDAKAN IN ('2068','2065','2066','2067')  
                                THEN E.QTY * 50000 
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
                , 0) AS TOTAL_SEMUA

            FROM MR.D_TINDAKAN_PAKET B  
            LEFT JOIN MR.D_PERAWAT G ON B.NIP_PERAWAT = G.NIP_PERAWAT  
            JOIN BILLING.D_TARIK_TAGIHAN_TINDAKAN C ON B.KD_REGISTRASI = C.KD_REGISTRASI AND B.NO_INDEX_TINDAKAN = C.INDEX_TINDAKAN  
            JOIN MR.MD_TINDAKAN_PAKET D ON B.KD_TINDAKAN = D.KD_TINDAKAN  
            JOIN BILLING.D_DETAIL_TAGIHAN E ON B.KD_REGISTRASI = E.KD_REGISTRASI AND B.NO_INDEX_TINDAKAN = E.NO_INDEX_REF  
            JOIN MR.D_DOKTER F ON B.NIP_DOKTER = F.NIP_DOKTER  
            JOIN MR.V_REGISTRASI A ON B.KD_REGISTRASI = A.KD_REGISTRASI  
            JOIN BILLING.D_TAGIHAN_TARIF_BPJS INACBG ON A.KD_REGISTRASI = INACBG.KD_REGISTRASI

            WHERE 
                DATE(B.TGL_TINDAKAN) >= TO_DATE(?,'YYYY/MM/DD')  
                AND DATE(B.TGL_TINDAKAN) <= TO_DATE(?,'YYYY/MM/DD')  
                AND D.KD_GROUP_TAGIHAN IN ('12','7','13','1','6','11')
                AND A.KD_JENIS_PASIEN = '2'  
                AND F.NIP_DOKTER = ?

            GROUP BY 
                INACBG.KD_REGISTRASI,
                A.TGL_REGISTRASI,
                A.NM_PASIEN, 
                INACBG.TARIF_BPJS, 
                F.KD_SPESIALIS

            ORDER BY A.NM_PASIEN ASC;
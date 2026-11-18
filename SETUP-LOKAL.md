# Panduan Menjalankan SIMRS-Wisnuhusada di Lokal (Windows)

## 1. Prasyarat WAJIB: Node.js versi lama
Project ini memakai **AdonisJS 4.1** yang tidak kompatibel dengan Node v18/v20+
(error `Cannot find module 'Server'` / `ERR_PACKAGE_PATH_NOT_EXPORTED`).

Gunakan **Node.js v14** via nvm-windows:
```bat
nvm install 14.21.3
nvm use 14.21.3
node --version   :: harus v14.x
```

## 2. Install Dependensi
```bat
cd C:\wisnu
rmdir /s /q node_modules
npm install --ignore-scripts
```
Catatan: `--ignore-scripts` diperlukan karena paket warisan `zlib@1.0.5`
gagal build native; paket itu tidak dipakai aplikasi.

## 3. Siapkan Database PostgreSQL Lokal
Server lama (`103.120.232.123:5000`) mungkin tidak terjangkau. Buat lokal:

1. Install PostgreSQL: https://www.postgresql.org/download/windows/ (port 5432).
2. Buat user & database lewat pgAdmin / psql:
```sql
CREATE USER sim_rsi WITH PASSWORD 'rsip2025' SUPERUSER;
CREATE DATABASE sim_rsi OWNER sim_rsi;
```
3. Import tabel master minimal agar CRUD & modul lab berfungsi:
```bat
psql -h localhost -U sim_rsi -d sim_rsi -f database\sql\local_schema.sql
```
4. Ubah `.env` (sudah disalin dari `.env.example`):
```
DB_CONNECTION=pg
DB_HOST=localhost
DB_PORT=5432
DB_USER=sim_rsi
DB_PASSWORD=rsip2025
DB_DATABASE=sim_rsi
```

## 4. Jalankan Migrasi Modul Lab
```bat
node ace migration:run
```
Membuat tabel: users, tokens, lab_jenis_pemeriksaan, lab_item, tarif_lab,
lab_reagen, lab_reagen_kebutuhan, lab_stok_transaksi, lab_permintaan, lab_hasil.

## 5. Jalankan Server
```bat
:: Mode development (auto-reload) — DISARANKAN
npm run dev

:: atau mode produksi
node server.js
```
Buka browser: **http://localhost:3333**

## 6. Menu Laboratorium
| Halaman | URL |
|---|---|
| Navbar Unit Lab | /admin/menu_laboratorium |
| 📊 Dashboard + Peringatan ARIMA | /admin/laboratorium/dashboard |
| 📝 Permintaan & Barcode | /admin/laboratorium/permintaan |
| 🔬 Proses Pemeriksaan & Validasi | /admin/laboratorium/pemeriksaan |
| 📦 Stok Reagen & Prediksi | /admin/laboratorium/stok |
| 📈 Laporan & Analitik | /admin/laboratorium/laporan |
| ⚙️ Master Data Lab | /admin/laboratorium |

## Troubleshooting
- **EADDRINUSE :::3333** → port dipakai: `netstat -ano | findstr 3333` lalu matikan PID-nya, atau ubah PORT di .env.
- **ECONNREFUSED 127.0.0.1:5432** → service PostgreSQL belum jalan (cek Services.msc).
- **Halaman 500 "relation ... does not exist"** → langkah migrasi/import SQL belum dijalankan.
- **Error POST 403/csrf** → pastikan akses lewat browser (session cookie), bukan curl manual.

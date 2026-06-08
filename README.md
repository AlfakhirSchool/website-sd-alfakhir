<div align="center">

# 🏫 SD ISLAM MODERN AL-FAKHIR
### _Smart Concept • Islamic Identity • Modern Character_

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Sanity CMS](https://img.shields.io/badge/Sanity-F03E2F?style=for-the-badge&logo=sanity&logoColor=white)](https://sanity.io/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/)

---

[**🌐 Live Website**](http://localhost:3000) • [**🔒 Portal Admin**](http://localhost:3000/gaming) • [**📝 Pendaftaran PPDB**](http://localhost:3000/pendaftaran)

</div>

## 🌟 Tentang Platform

Repositori ini memuat kode sumber resmi untuk portal informasi, pendaftaran daring (PPDB), dan **Sistem Manajemen Informasi Berbasis Cloud** milik **SD Islam Modern Al-Fakhir**, Kota Depok. 

Sistem dibangun ulang menggunakan arsitektur **Next.js App Router (v16.2+)** berkecepatan tinggi dengan *Turbopack* serta mengadopsi integrasi mulus dengan **Sanity CMS** sebagai *headless backend* untuk pembaruan konten riil secara seketika.

---

## 🚀 Fitur Unggulan & Arsitektur Keamanan

### 🔒 Otentikasi Admin Berbasis Google Cloud Sign-In
Sistem kontrol panel admin pada rute `/gaming` dilindungi secara ketat menggunakan protokol **Google Sign-In API**.
- **Akses Eksklusif**: Sistem secara otomatis memecah token JWT dan **hanya** mengizinkan email resmi sekolah **`sdialfakhir@gmail.com`** untuk membuka dasbor.
- **Proteksi Aktif (Opsi A)**: Jika upaya login dilakukan oleh akun Google pribadi lainnya, akses langsung diblokir disertai notifikasi penolakan ramah namun tegas dari sistem.

### 📊 Manajemen PPDB & Observasi Terisolasi
- Pendaftar baru dari jalur web daring secara otomatis dipisahkan dari tabel seleksi/observasi luring agar proses verifikasi dan wawancara dapat dilakukan dengan fokus dan tertata.
- Terhubung penuh dengan skema dokumen `student` di Sanity CMS.

### 🎨 Desain Premium & Multi-Bahasa
- Menggunakan standar antarmuka premium, warna harmonis bernuansa keemasan dan biru laut gelap, serta tipografi modern yang responsif di seluruh ukuran layar.
- Terintegrasi dengan fitur pengalih bahasa instan (Indonesia / Inggris).

---

## 📁 Struktur Repositori

```text
web-sd/
├── frontend/          # Aplikasi Utama Next.js (App Router, Komponen UI, Konteks)
│   ├── src/app/       # Rute Halaman (page.jsx, gaming/page.jsx, pendaftaran/page.jsx)
│   ├── src/components/# Komponen Modular (Footer, SmartImage, Registration)
│   └── .env           # Variabel Lingkungan & Kredensial Client ID
├── backend/           # Ruang Kerja Sanity Studio (Skema Dokumen, Struktur)
└── package.json       # Skrip Delegasi Ruang Kerja Global
```

---

## 🛠️ Panduan Instalasi & Pengembangan Lokal

### 1. Kloning Repositori
```bash
git clone https://github.com/username-anda/web-sd.git
cd web-sd
```

### 2. Konfigurasi Kredensial (`.env`)
Buat atau salin file `.env` di dalam folder `frontend/` dan masukkan Client ID Google Cloud serta konfigurasi Sanity Anda:
```env
# Otentikasi Google Cloud
NEXT_PUBLIC_GOOGLE_CLIENT_ID=masukkan_google_client_id_anda_disini.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=masukkan_google_client_id_anda_disini.apps.googleusercontent.com

# Sanity CMS
VITE_SANITY_PROJECT_ID=id_proyek_sanity_anda
VITE_SANITY_DATASET=production
```

### 3. Jalankan Server Pengembangan
Dari root direktori, jalankan skrip otomatis:
```bash
npm run dev
```
Server Next.js dengan Turbopack akan langsung aktif di **`http://localhost:3000`**.

---

## 👨‍💻 Tim Pengembang

Platform ini dikembangkan dan dikelola secara profesional oleh:
- **Developer by Feri**

© 2026 SD Islam Modern Al-Fakhir. Semua Hak Dilindungi.

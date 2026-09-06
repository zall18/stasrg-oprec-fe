# Frontend Task Tracker & Roadmap
## Project: Sistem Rekrutmen STAS-RG (UI & API Integration)

Dokumen ini adalah acuan kerja khusus untuk pengembangan sisi **Frontend (FE)**. Semua urusan pengelolaan *database* telah dihilangkan dari daftar ini, dan Frontend hanya akan berfokus pada merancang UI serta menghubungkannya (mengonsumsi) data dari REST API Backend yang sudah disediakan.

### 🎯 Tujuan & Pencapaian Utama (Goals)
1. **Navigasi Lengkap:** Menyediakan halaman Landing Page, Login, Register, Dashboard User, dan Dashboard Admin.
2. **Formulir Dinamis:** Membangun antarmuka input untuk pendaftaran Golden Candidate dan jalur Oprec.
3. **Integrasi API:** Menghubungkan seluruh form dan tabel data ke API Endpoint yang sesuai.
4. **UI/UX Konsisten:** Mengimplementasikan panduan *Muted Earthy Glassmorphism*.

---

### 📦 Phase 1: Setup Lingkungan Frontend & Routing
- [ ] Inisiasi proyek (misal: Next.js App Router atau React Vite).
- [ ] Konfigurasi Tailwind CSS (terapkan palet warna *Muted Earthy* dan font *Plus Jakarta Sans/Inter*).
- [ ] Setup file `.env` khusus untuk URL Base API (contoh: `NEXT_PUBLIC_API_URL`).
- [ ] Siapkan struktur *folder/routing* untuk:
  - `/` (Landing Page)
  - `/auth/login` & `/auth/register` (Autentikasi)
  - `/dashboard` (Dashboard utama kandidat)
  - `/dashboard/golden-candidate` (Formulir input)
  - `/dashboard/oprec` (Halaman daftar oprec)
  - `/admin/...` (Area khusus Admin)

### 🎨 Phase 2: Pembuatan Komponen UI Inti (Foundation)
- [ ] Buat komponen `GlassCard` wrapper (`bg-white/40 backdrop-blur-md rounded-3xl`).
- [ ] Buat komponen `Button` (Primary Muted Green, Secondary Transparan).
- [ ] Buat komponen `Input`, `Select/Dropdown`, dan `File Dropzone` khusus PDF.
- [ ] Buat komponen `Badge` warna-warni pudar untuk penanda status seleksi.
- [ ] Konfigurasi pustaka validasi form (React Hook Form + Zod).
- [ ] **✅ MANDATORY:** Jalankan `npm run build` untuk cek *error typing/linting* komponen dasar.

### 🌐 Phase 3: Halaman Publik & Autentikasi
- [ ] **Landing Page (`/`):** Desain halaman depan yang menjelaskan STAS-RG dan *role* Mahasiswa Riset & Magang.
- [ ] **Register Page (`/auth/register`):** Buat form pendaftaran akun (layout *split-screen* transparan). Hubungkan ke API Register.
- [ ] **Login Page (`/auth/login`):** Buat form login. Hubungkan ke API Login dan simpan *token* akses (JWT/Sesi) dengan aman.
- [ ] **✅ MANDATORY:** Buat *test* untuk alur login/register. Jalankan `npm run build`.

### 👤 Phase 4: Dashboard Kandidat & Form Pendaftaran
- [ ] **Dashboard Home (`/dashboard`):** Halaman sambutan yang menampilkan ringkasan status kandidat (apakah profil sudah lengkap, dsb).
- [ ] **Input Golden Candidate (`/dashboard/golden-candidate`):** 
  - Buat form panjang/bertahap untuk melengkapi data diri, universitas, prodi, role, tautan portofolio, dan unggah CV/Transkrip.
  - Hubungkan tombol *Submit* ke API *Profile/Golden Candidate*.
- [ ] **Halaman Oprec (`/dashboard/oprec`):** 
  - Buat UI khusus pendaftaran Oprec (hanya bisa diklik jika API menyatakan pendaftaran Oprec sedang buka).
  - Hubungkan ke API pendaftaran Oprec.
- [ ] **✅ MANDATORY:** Uji coba validasi Zod (pastikan input CV ditolak jika > 5MB). Jalankan `npm run build`.

### 👑 Phase 5: Dashboard Admin (Manajemen Data)
- [ ] **Admin Dashboard (`/admin/dashboard`):** Halaman ringkasan/statistik jumlah pendaftar.
- [ ] **Tabel Kandidat (`/admin/candidates`):** 
  - Tampilkan data pelamar dalam bentuk tabel. 
  - Integrasikan filter/tabs untuk memisahkan pendaftar *Golden Candidate* dan *Oprec*. Hubungkan ke API Get Candidates.
- [ ] **Detail Kandidat:** Modal/Halaman untuk melihat detail pelamar dan fitur pratinjau (*preview*)/unduh CV & Transkrip.
- [ ] **Aksi Admin:** Integrasikan *dropdown* untuk mengubah Status Seleksi (menembak API Update Status). Munculkan *input field* "Nama Proyek" jika status diubah menjadi Diterima.
- [ ] **✅ MANDATORY:** Lakukan tes alur admin (login -> lihat tabel -> ubah status). Jalankan `npm run build`.

### 🚀 Phase 6: Polish, Loading State & Deployment
- [ ] Tambahkan *Loading State* (Skeleton/Spinner) saat aplikasi sedang *fetching* data dari API.
- [ ] Tambahkan *Toast Notifications* (Notifikasi sukses/gagal saat submit form).
- [ ] Lakukan End-to-End (E2E) testing menyeluruh untuk UI Kandidat dan UI Admin.
- [ ] **✅ FINAL DEPLOYMENT:** Jalankan *build* tahap akhir (`npm run build`) dan *deploy* aplikasi (misal ke Vercel atau layanan *hosting* statis lainnya)
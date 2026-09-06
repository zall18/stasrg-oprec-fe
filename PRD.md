# Frontend Product Requirements Document (PRD)
## Sistem Rekrutmen STAS-RG

### 1. Overview
Dokumen ini mendefinisikan spesifikasi teknis khusus untuk sisi Frontend (FE) dari Sistem Rekrutmen STAS-RG. Antarmuka ini melayani dua jenis pengguna utama: **Kandidat** (mahasiswa yang mendaftar) dan **Admin** (PIC Lab untuk manajemen seleksi).

### 2. Tech Stack Frontend
- **Framework:** Next.js (App Router) atau React (Vite)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI atau Material UI (MUI) untuk komponen cepat (Tabel, Modal, Dropdown, Tabs).
- **Form Management & Validation:** React Hook Form + Zod (untuk validasi *client-side* yang ketat).
- **Data Fetching:** SWR atau React Query (memudahkan *caching* dan *re-fetching* data).
- **Testing:** Jest + React Testing Library (Unit Test UI), Cypress (E2E Test).

### 3. Struktur Halaman & Routing
Sistem akan dibagi menjadi beberapa *route* utama:

#### 3.1. Public / Guest Routes
- `/` (Landing Page): Informasi mengenai STAS-RG, deskripsi *role* (Mahasiswa Riset & Magang).
- `/auth/login`: Halaman login kandidat dan admin.
- `/auth/register`: Halaman pembuatan akun baru.

#### 3.2. Candidate Routes (Protected)
- `/dashboard/candidate`: Halaman utama kandidat. Menampilkan status profil (sudah lengkap atau belum).
- `/dashboard/candidate/profile`: Formulir pendaftaran *Golden Candidate* (pengisian data diri, upload CV, dll).
- `/dashboard/candidate/oprec`: Halaman khusus yang hanya muncul/aktif ketika masa Oprec dibuka. Berisi informasi *batch* dan tombol "Daftar Oprec Sekarang".

#### 3.3. Admin Routes (Protected - Role: ADMIN)
- `/dashboard/admin`: Halaman *overview* statistik pelamar (jumlah pelamar Oprec, jumlah Golden Candidate).
- `/dashboard/admin/candidates`: Tabel utama manajemen pendaftar.
- `/dashboard/admin/candidates/[id]`: Halaman detail satu pendaftar.

### 4. Spesifikasi UI/UX & Komponen Inti

#### 4.1. Form Profil Kandidat (Golden Candidate)
- **Tipe UI:** *Multi-step form* atau satu halaman panjang yang dibagi dalam *Card* (Informasi Pribadi, Akademik, Dokumen).
- **Input Khusus:**
  - *Dropdown* untuk Pemilihan Program Studi dan Role (Riset/Magang).
  - *File Input/Dropzone* untuk CV dan Transkrip.
- **Validasi Klien (Zod):**
  - File wajib berformat `.pdf`.
  - Ukuran maksimal *strict* di angka `5MB`. Jika melebih batas, tampilkan pesan *error* warna merah di bawah *input file* tanpa perlu melakukan hit ke *backend*.
  - Link portofolio harus berupa format URL valid (`https://...`).

#### 4.2. Dashboard Admin - Tabel Pendaftar
- **Komponen:** *Data Table* dengan fitur *Pagination*.
- **Tampilan Data (Tabs/Toggle):** Harus ada tombol *switch* atau *Tabs* untuk berpindah antara "Daftar Golden Candidate" dan "Daftar Oprec Aktif".
- **Kolom Tabel:** Nama, NIM, Universitas, Pilihan Role, Status Seleksi, Tanggal Daftar.
- **Indikator Visual (Badges):**
  - Tampilkan *Badge* warna khusus (misal: kuning/emas) di sebelah nama pelamar jika dia masuk melalui jalur *Golden Candidate*.
  - *Badge* warna untuk Status: `PENDING` (Abu-abu), `SELEKSI BERKAS` (Biru), `WAWANCARA` (Ungu), `DITERIMA` (Hijau).

#### 4.3. Dashboard Admin - Detail & Aksi Kandidat
- **Detail View:** Menampilkan seluruh data teks. Untuk CV dan Transkrip, sediakan tombol "Preview File" (membuka PDF di tab baru) dan "Download File".
- **Action - Update Status:** Sebuah *Dropdown Menu* untuk mengubah status seleksi.
- **Action - Assign Project:** Jika status diubah menjadi `DITERIMA`, akan muncul *input text field* secara dinamis untuk mengisikan "Nama Proyek Spesifik". Tombol simpan akan men-trigger *request PATCH* ke backend.

### 5. State Management & Data Fetching
- **Auth State:** Gunakan *React Context* atau Zustand untuk menyimpan sesi pengguna (Nama, Email, Role `CANDIDATE` atau `ADMIN`).
- **Form State:** Form yang panjang disarankan menyimpan state secara sementara, namun pengiriman (*submit*) hanya terjadi saat validasi seluruh *field* terpenuhi.
- **Loading State:** Wajib mengimplementasikan *Skeleton Loader* atau *Spinner* saat aplikasi menunggu balasan (*response*) dari API backend.

### 6. Aturan Khusus Pengembangan & Testing
- Setiap komponen form **wajib** memiliki unit test untuk memastikan validasi (seperti batas 5MB PDF) bekerja sebelum *submit*.
- **Mandatory Build Check:** Setiap selesai mengerjakan modul (contoh: modul Auth, modul Candidate, modul Admin), *developer* wajib menjalankan `npm run build` untuk memastikan Next.js/Vite tidak memiliki *error* tipe (TypeScript/Lint) atau referensi *module* yang hilang.
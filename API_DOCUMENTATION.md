# STAS-RG Recruitment API Documentation

This document contains the complete details of all available APIs for the STAS-RG Recruitment Web Backend, including their routes, required parameters, and expected responses.

All endpoints below assume a base prefix (e.g., `/api` or `/api/v1` depending on your `app.use` configuration in `app.ts` / `server.ts`).

---

## Standard Response Format
Semua endpoint mengembalikan data dengan format JSON standar (mengikuti `success`, `message`, dan `data`):

```json
{
  "success": true,
  "message": "Pesan status dari operasi",
  "data": { 
    // object atau array data 
  } 
}
```

Bila terjadi error (validasi atau server):
```json
{
  "success": false,
  "message": "Pesan error"
}
```

---

## 1. Public API
Rute ini dapat diakses secara publik tanpa perlu autentikasi.

### 1.1. Health Check
- **Endpoint**: `GET /health`
- **Description**: Memastikan server berjalan dengan baik.
- **Parameters**: None
- **Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-09-06T20:20:00.000Z",
  "service": "STAS-RG Recruitment API"
}
```

### 1.2. Get Oprec Status
- **Endpoint**: `GET /public/oprec-status`
- **Description**: Mengambil status pendaftaran Oprec (Open Recruitment) yang sedang berjalan saat ini.
- **Parameters**: None
- **Response**:
```json
{
  "success": true,
  "message": "Status oprec berhasil diambil",
  "data": {
    "isActive": true,
    "currentBatch": "Batch 1",
    "startDate": "...",
    "endDate": "...",
    "description": "..."
  }
}
```

---

## 2. Authentication API
Digunakan untuk pendaftaran pengguna baru dan masuk (login).

### 2.1. Register User
- **Endpoint**: `POST /auth/register`
- **Description**: Mendaftarkan akun pengguna baru.
- **Body** (JSON):
  - `email` (string, **wajib**): Format email yang valid.
  - `password` (string, **wajib**): Minimal 6 karakter.
  - `role` (enum, *opsional*): `CANDIDATE` (default) atau `ADMIN`.
- **Response**:
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": { "id": "...", "email": "...", "role": "CANDIDATE" },
    "token": "eyJhbGci..."
  }
}
```

### 2.2. Login User
- **Endpoint**: `POST /auth/login`
- **Description**: Login pengguna dan mengembalikan JWT Token untuk otorisasi endpoint yang dilindungi.
- **Body** (JSON):
  - `email` (string, **wajib**): Format email.
  - `password` (string, **wajib**): Password akun.
- **Response**:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": { "id": "...", "email": "...", "role": "..." },
    "token": "eyJhbGci..."
  }
}
```

---

## 3. Candidate API
Rute ini khusus untuk pengguna dengan role `CANDIDATE`. 
> [!IMPORTANT]
> **Wajib menyertakan Header Authorization**: `Bearer <token>` di setiap request.

### 3.1. Upsert Profile
- **Endpoint**: `POST /candidate/profile`
- **Description**: Membuat (create) atau memperbarui (update) profil kandidat.
- **Body** (JSON):
  - `fullName` (string, **wajib**)
  - `universitas` (string, **wajib**)
  - `nim` (string, **wajib**)
  - `programStudi` (string, **wajib**)
  - `roleInterest` (enum, **wajib**): Harus bernilai `RISET` atau `MAGANG`.
  - `cvUrl` (string/URL, **wajib**): Tautan URL CV kandidat.
  - `portfolioUrl` (string/URL, **wajib**): Tautan URL portofolio.
  - `transkripUrl` (string/URL, *opsional*): Tautan URL file transkrip.
  - `ipk` (number, *opsional*): Nilai desimal dari 0 sampai 4.0.
  - `semester` (number, *opsional*): Integer dari 1 sampai 14.
  - `pengalaman` (string, *opsional*)
- **Response**:
```json
{
  "success": true,
  "message": "Profil berhasil disimpan",
  "data": { /* Data profil terbaru */ }
}
```

### 3.2. Get Profile
- **Endpoint**: `GET /candidate/profile`
- **Description**: Mengambil detail profil kandidat yang sedang login.
- **Parameters**: None

### 3.3. Apply Oprec
- **Endpoint**: `POST /candidate/apply-oprec`
- **Description**: Mendaftarkan diri pada program rekrutmen/batch yang sedang berlangsung.
- **Body** (JSON):
  - `batchName` (string, *opsional*): Jika tidak diisi, otomatis mendaftar pada batch yang sedang aktif saat ini.
- **Response**:
```json
{
  "success": true,
  "message": "Berhasil mendaftar oprec",
  "data": {
    "id": "...", // ID Registrasi
    "batch": "Batch 1",
    "status": "PENDING"
  }
}
```

---

## 4. Admin API
Rute ini khusus untuk pengguna dengan role `ADMIN`.
> [!IMPORTANT]
> **Wajib menyertakan Header Authorization**: `Bearer <token>` di setiap request.

### 4.1. Dashboard Stats
- **Endpoint**: `GET /admin/dashboard/stats`
- **Description**: Mengambil metrik analitik seperti jumlah pendaftar, sebaran role, dan status.
- **Query Params**:
  - `batch` (string, *opsional*): Filter metrik khusus untuk batch tertentu.
- **Response**:
```json
{
  "success": true,
  "message": "Statistik berhasil diambil",
  "data": {
    "totalCandidates": 45,
    "statusCounts": { "PENDING": 10, "SELEKSI_BERKAS": 15, "DITERIMA": 5, ... },
    "roleCounts": { "RISET": 25, "MAGANG": 20 }
  }
}
```

### 4.2. Get Recruitment Setting
- **Endpoint**: `GET /admin/settings/oprec`
- **Description**: Mengambil status pendaftaran saat ini dari database.
- **Parameters**: None

### 4.3. Update Recruitment Setting
- **Endpoint**: `PATCH /admin/settings/oprec`
- **Description**: Mengubah status pendaftaran atau batch yang aktif.
- **Body** (JSON):
  - `isActive` (boolean, **wajib**): Menyalakan/mematikan periode pendaftaran.
  - `currentBatch` (string, **wajib**): Nama batch.
  - `startDate` (ISO datetime string, *opsional*)
  - `endDate` (ISO datetime string, *opsional*)
  - `description` (string, *opsional*)

### 4.4. Get Candidates (List)
- **Endpoint**: `GET /admin/candidates`
- **Description**: Mendapatkan semua data pendaftar beserta fitur pencarian, filter, dan paginasi.
- **Query Params**:
  - `search` (string, *opsional*): Cari nama, email, universitas, atau NIM.
  - `batch` (string, *opsional*)
  - `status` (enum, *opsional*): `PENDING`, `SELEKSI_BERKAS`, `WAWANCARA_1`, `WAWANCARA_2`, `DITERIMA`.
  - `roleInterest` (enum, *opsional*): `RISET` atau `MAGANG`.
  - `isGolden` (boolean string 'true' / 'false', *opsional*): Filter pendaftar golden ticket.
  - `page` (number, *opsional*, default: 1)
  - `limit` (number, *opsional*, default: 10)
- **Response**:
```json
{
  "success": true,
  "message": "Daftar kandidat berhasil diambil",
  "data": {
    "candidates": [ /* Array pendaftar */ ],
    "meta": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

### 4.5. Get Candidate by ID
- **Endpoint**: `GET /admin/candidates/:id`
- **Description**: Melihat detail lengkap kandidat dari akun ID-nya.
- **Path Params**:
  - `id` (uuid, **wajib**): ID user pendaftar.

### 4.6. Export Candidates
- **Endpoint**: `GET /admin/candidates/export`
- **Description**: Mengunduh seluruh data pendaftar (Bisa digunakan untuk output file CSV/Excel tergantung implementasi controller).

### 4.7. Update Candidate Status
- **Endpoint**: `PATCH /admin/candidates/:registrationId/status`
- **Description**: Mengubah status tahapan seleksi pendaftar.
- **Path Params**:
  - `registrationId` (uuid, **wajib**): ID dari pendaftaran.
- **Body** (JSON):
  - `status` (enum, **wajib**): `PENDING`, `SELEKSI_BERKAS`, `WAWANCARA_1`, `WAWANCARA_2`, atau `DITERIMA`.

### 4.8. Assign Project
- **Endpoint**: `PATCH /admin/candidates/:registrationId/project`
- **Description**: Memberikan dan mendaftarkan peserta khusus untuk *assigned project* (Golden ticket).
- **Path Params**:
  - `registrationId` (uuid, **wajib**): ID dari pendaftaran.
- **Body** (JSON):
  - `assignedProject` (string, **wajib**): Nama project yang ditugaskan.

---

## 5. Upload API
Rute ini digunakan untuk mengunggah dokumen/file ke storage.
> [!IMPORTANT]
> **Wajib menyertakan Header Authorization**: `Bearer <token>`.

### 5.1. Upload Document
- **Endpoint**: `POST /upload/document`
- **Description**: Mengunggah file PDF (misalnya CV atau Transkrip) dengan batas ukuran maksimal 5 MB.
- **Header**: `Content-Type: multipart/form-data`
- **Form-Data**:
  - `file` (File, **wajib**): Harus berformat `.pdf` (`application/pdf`).
- **Response**:
```json
{
  "success": true,
  "message": "Dokumen berhasil diunggah",
  "data": {
    "url": "https://<cloud-storage-url>/file.pdf"
  }
}
```

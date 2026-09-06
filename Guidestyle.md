# UI/UX Style Guide (Guidestyle.md)
## Sistem Rekrutmen STAS-RG

### 1. Design Concept: "Muted Earthy Glassmorphism"
Berdasarkan referensi desain dan permintaan khusus, tema visual aplikasi ini akan menggunakan pendekatan **Glassmorphism (Efek Kaca Transparan)** yang dipadukan dengan warna-warna *earthy* yang pudar (*muted / desaturated*). 
Desain ini menghindari warna-warna mencolok/cerah (neon), dan mengandalkan transparansi, *blur*, serta sudut melengkung (*rounded*) untuk memberikan kesan modern, bersih, dan elegan.

---

### 2. Color Palette (Tailwind CSS Reference)
Warna yang digunakan sangat dibatasi pada *tone* alam yang lembut (Hijau Hutan pudar, Krem, Abu-abu kehijauan).

*   **Primary Action (Tombol Utama, Aksen Penting):**
    *   Muted Forest Green: `#274432` atau `bg-emerald-900/90`
    *   *Hover state:* `#1F3628`
*   **Background Base (Warna Latar Belakang Paling Belakang):**
    *   Soft Beige / Greenish Grey: `#F2F4F0` atau paduan *mesh gradient* yang sangat pudar antara krem dan hijau pastel redup.
*   **Surface / Cards (Warna Komponen Transparan):**
    *   White Glass: `rgba(255, 255, 255, 0.4)` atau di Tailwind: `bg-white/40`
    *   Dark Glass (Opsional untuk *dark mode* / *footer*): `bg-black/10`
*   **Text (Tipografi):**
    *   Heading / Primary Text: `#1A201C` (Abu-abu sangat gelap, jangan pakai `#000000` murni).
    *   Secondary / Muted Text: `#64746A` (Abu-abu kehijauan).
*   **Inputs (Kolom Isian - Mengacu pada gambar referensi):**
    *   Idle: `bg-[#F5F7EC]/50` (Krem transparan lembut)
    *   Focus: `bg-[#F5F7EC]/80` (Lebih solid saat diketik)

---

### 3. Typography
Gunakan *font* *sans-serif* yang geometris dan bersih.
*   **Primary Font:** `Plus Jakarta Sans`, `Outfit`, atau `Inter`.
*   **Heading (H1, H2, H3):** Gunakan *font-weight* `Bold` (700) atau `ExtraBold` (800) dengan *tracking* (spasi antar huruf) sedikit rapat (`tracking-tight`).
*   **Body Text:** Gunakan *font-weight* `Regular` (400) atau `Medium` (500) dengan *line-height* yang lega (`leading-relaxed`).

---

### 4. UI Component Styling (Tailwind Classes)

Poin utama dari desain ini adalah pemakaian `backdrop-blur` dan `border` putih tipis untuk menciptakan efek kaca transparan yang tidak mencolok.

#### A. Glass Card (Container / Form Wrapper)
Alih-alih menggunakan kotak putih *solid*, gunakan kelas berikut untuk *container* pendaftaran atau *dashboard*:
```html
<div class="bg-white/40 backdrop-blur-md border border-white/30 rounded-3xl shadow-sm">
  <!-- Konten -->
</div>
```
*(Catatan: Sudut sangat melengkung `rounded-3xl` mengikuti gaya desain dari gambar referensi).*

#### B. Buttons (Tombol)
*   **Primary Button (Masuk/Daftar):**
    ```html
    <button class="bg-[#274432]/90 hover:bg-[#274432] text-white backdrop-blur-sm rounded-full px-8 py-3 transition-all font-semibold">
      Masuk Sekarang →
    </button>
    ```
*   **Secondary Button (Outline/Transparan):**
    ```html
    <button class="bg-white/30 hover:bg-white/50 border border-white/50 text-[#274432] rounded-full px-8 py-3 transition-all font-semibold backdrop-blur-sm">
      Batal
    </button>
    ```

#### C. Input Fields
Bentuk input harus *rounded-full* (pill-shaped) dan sedikit transparan agar menyatu dengan *background*.
```html
<input 
  type="text" 
  class="w-full bg-[#F5F7EC]/50 focus:bg-[#F5F7EC]/80 border border-transparent focus:border-[#274432]/30 rounded-full px-5 py-3 text-sm text-[#1A201C] outline-none transition-all backdrop-blur-sm placeholder:text-[#64746A]"
  placeholder="102022530058"
/>
```

#### D. Badges / Status Indicators
Gunakan warna pastel yang dipudarkan (*desaturated*) dipadu transparansi.
*   **Diterima (Hijau Muted):** `bg-emerald-500/20 text-emerald-800 border border-emerald-500/20`
*   **Pending (Abu-abu Muted):** `bg-gray-500/20 text-gray-800 border border-gray-500/20`

---

### 5. Layouting & Whitespace
*   **Spacious:** Berikan jarak (*padding* dan *margin*) yang cukup besar antar elemen. Desain transparan akan terlihat kotor (berantakan) jika elemen-elemen terlalu berdempetan.
*   **Split Screen (khusus Login/Register):** Seperti referensi gambar, bagi layar menjadi dua (Grid 2 kolom). Sebelah kiri untuk form transparan, sebelah kanan untuk ilustrasi *line-art* atau logo dengan warna *background base* yang bersih.
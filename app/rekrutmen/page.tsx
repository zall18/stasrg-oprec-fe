"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth.store";
import { useToast } from "@/components/ui/toast";
import { Logo } from "@/components/ui/logo";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dropzone } from "@/components/ui/dropzone";
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  Award,
  CheckCircle,
  FileCheck,
  Rocket,
  ShieldCheck,
  ArrowRight,
  Info,
  Calendar,
  HelpCircle,
  Lock,
  Mail,
} from "lucide-react";

// Schema for direct registration & apply
const publicApplySchema = z.object({
  fullName: z.string().trim().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
  universitas: z.string().trim().min(2, "Universitas wajib diisi"),
  nim: z.string().trim().min(4, "NIM wajib diisi"),
  programStudi: z.string().trim().min(2, "Program studi wajib diisi"),
  roleInterest: z.enum(["RISET", "MAGANG"]),
  portfolioUrl: z.string().url("URL portofolio harus valid (https://...)"),
  ipk: z.number().min(0).max(4.0).optional(),
  semester: z.number().int().min(1).max(14).optional(),
  pengalaman: z.string().optional(),
});

type PublicApplyInput = z.infer<typeof publicApplySchema>;

export default function RekrutmenPage() {
  const router = useRouter();
  const toast = useToast();
  const { isAuthenticated, user, setAuth, loadFromStorage } = useAuthStore();

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [transkripFile, setTranskripFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oprecStatus, setOprecStatus] = useState<any>(null);

  useEffect(() => {
    loadFromStorage();
    api.getOprecStatus().then((res) => {
      setOprecStatus(res.data?.data);
    }).catch(() => {});
  }, [loadFromStorage]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PublicApplyInput>({
    resolver: zodResolver(publicApplySchema),
    defaultValues: {
      roleInterest: "RISET",
    },
  });

  const onSubmit = async (data: PublicApplyInput) => {
    if (!cvFile) {
      toast.error("Berkas CV dalam format PDF (maks 5MB) wajib diunggah!");
      return;
    }

    setIsSubmitting(true);
    try {
      let activeToken = localStorage.getItem("stasrg_token");

      // If user is not authenticated, register account first
      if (!isAuthenticated || !activeToken) {
        if (!data.password || data.password.length < 6) {
          throw new Error("Kata sandi minimal 6 karakter diperlukan untuk membuat akun.");
        }

        toast.info("Mendaftarkan akun kandidat baru...");
        const regRes = await api.register({
          email: data.email,
          password: data.password,
          role: "CANDIDATE",
        });

        const authUser = regRes.data?.data?.user;
        activeToken = regRes.data?.data?.token;

        if (!activeToken || !authUser) {
          throw new Error("Gagal memperoleh sesi pendaftaran akun.");
        }

        setAuth(authUser, activeToken);
      }

      // Upload CV File
      toast.info("Mengunggah berkas CV...");
      const cvUploadRes = await api.uploadDocument(cvFile);
      const cvUrl = cvUploadRes.data?.data?.url;

      if (!cvUrl) throw new Error("Gagal mengunggah berkas CV");

      // Upload Transkrip if provided
      let transkripUrl: string | undefined = undefined;
      if (transkripFile) {
        toast.info("Mengunggah berkas transkrip...");
        const trUploadRes = await api.uploadDocument(transkripFile);
        transkripUrl = trUploadRes.data?.data?.url;
      }

      // Save profile
      toast.info("Menyimpan data profil kandidat...");
      await api.upsertCandidateProfile({
        fullName: data.fullName,
        universitas: data.universitas,
        nim: data.nim,
        programStudi: data.programStudi,
        roleInterest: data.roleInterest,
        portfolioUrl: data.portfolioUrl,
        cvUrl,
        transkripUrl,
        ipk: data.ipk,
        semester: data.semester,
        pengalaman: data.pengalaman,
      });

      // Also apply for the active oprec batch if open
      try {
        await api.applyOprec(oprecStatus?.currentBatch);
      } catch {
        // If already applied or inactive, profile is still saved
      }

      toast.success("Pendaftaran berhasil! Anda akan dialihkan ke Dashboard.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirimkan formulir pendaftaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBatchActive = Boolean(
    oprecStatus?.isOprecActive ?? oprecStatus?.isActive ?? false
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F4F0] text-[#1A201C]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-4 backdrop-blur-md bg-white/30 border-b border-white/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo size="md" subtitle="Panduan & Pendaftaran" />
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="primary" size="sm">
                  Dashboard Saya
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Masuk
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    Registrasi
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-12 pb-8 flex flex-col items-center text-center gap-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-white/60 shadow-xs text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Informasi Resmi Rekrutmen Laboratorium STAS-RG</span>
          <Badge variant={isBatchActive ? "DITERIMA" : "PENDING"}>
            {isBatchActive ? "Batch Aktif Dibuka" : "Jalur Golden Terbuka"}
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Panduan Lengkap Seleksi & Pendaftaran Kandidat
        </h1>
        <p className="text-sm sm:text-base text-[#64746A] max-w-2xl leading-relaxed">
          Pelajari peran riset, persyaratan berkas, alur tahapan seleksi, dan
          kirimkan formulir pendaftaran Anda secara langsung di halaman ini.
        </p>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 pb-20 flex flex-col gap-12">
        {/* Section 1: Detail 3 Jalur Peran */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight text-[#1A201C]">
              1. Pilih Jalur Peran yang Tepat untuk Anda
            </h2>
            <p className="text-xs text-[#64746A]">
              STAS-RG menyediakan dua peminatan utama dan satu jalur prioritas portofolio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-[#1A201C]">
                  Mahasiswa Riset
                </h3>
                <p className="text-xs text-[#64746A] leading-relaxed">
                  Bagi mahasiswa yang tertarik pada eksplorasi ilmiah mendalam,
                  pemrosesan data sensor LiDAR/Kamera, deep learning, dan
                  penulisan karya ilmiah bereputasi.
                </p>
              </div>
              <div className="text-[11px] text-[#274432] font-semibold pt-2 border-t border-black/5 mt-auto flex flex-col gap-1">
                <span>✓ Fokus Publikasi Jurnal / Konferensi</span>
                <span>✓ Akses Simulator Robotika ROS</span>
              </div>
            </GlassCard>

            <GlassCard className="p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-[#1A201C]">
                  Mahasiswa Magang
                </h3>
                <p className="text-xs text-[#64746A] leading-relaxed">
                  Bagi mahasiswa yang ingin mengasah keterampilan implementasi
                  software, backend API, antarmuka web, serta integrasi IoT
                  langsung pada proyek mitra industri lab.
                </p>
              </div>
              <div className="text-[11px] text-[#274432] font-semibold pt-2 border-t border-black/5 mt-auto flex flex-col gap-1">
                <span>✓ Portofolio Skala Industri Nyata</span>
                <span>✓ Dukungan Konversi SKS Magang</span>
              </div>
            </GlassCard>

            <GlassCard variant="tinted" className="p-6 flex flex-col gap-4 border-amber-600/30">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-900">
                <Award className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#1A201C]">
                    Golden Candidate
                  </h3>
                  <Badge variant="GOLDEN">Prioritas</Badge>
                </div>
                <p className="text-xs text-[#64746A] leading-relaxed">
                  Bagi talenta berprestasi dengan bukti karya nyata (repository
                  aktif, portofolio juara kompetisi, atau publikasi terdahulu).
                </p>
              </div>
              <div className="text-[11px] text-amber-900 font-semibold pt-2 border-t border-black/5 mt-auto flex flex-col gap-1">
                <span>★ Fast-track seleksi berkas</span>
                <span>★ Prioritas langsung Assigned Project</span>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Section 2: Ketentuan Berkas & Keamanan Data */}
        <GlassCard className="p-6 sm:p-8 flex flex-col gap-4 border-white/60">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <h2 className="text-base font-bold text-[#1A201C]">
              2. Ketentuan Berkas Dokumen (Wajib Diperhatikan)
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#64746A]">
            <div className="p-4 rounded-2xl bg-white/40 border border-black/5 flex flex-col gap-1.5">
              <span className="font-bold text-[#1A201C]">Format Dokumen CV</span>
              <p>Wajib berekstensi <strong>.pdf</strong>. Berkas non-PDF akan ditolak secara otomatis oleh sistem klien.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/40 border border-black/5 flex flex-col gap-1.5">
              <span className="font-bold text-[#1A201C]">Batas Ukuran Maksimal 5MB</span>
              <p>Ukuran file dibatasi ketat maksimal <strong>5 Megabytes</strong> untuk menjaga kecepatan proses verifikasi.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/40 border border-black/5 flex flex-col gap-1.5">
              <span className="font-bold text-[#1A201C]">Tautan Portofolio Valid</span>
              <p>Cantumkan URL aktif (GitHub, LinkedIn, atau Google Drive) dengan awalan <strong>https://</strong>.</p>
            </div>
          </div>
        </GlassCard>

        {/* Section 3: Formulir Pendaftaran Terpadu */}
        <div id="formulir-pendaftaran" className="flex flex-col gap-6 scroll-mt-24">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight text-[#1A201C] flex items-center gap-2">
              <Rocket className="w-5 h-5 text-[#274432]" />
              3. Formulir Pendaftaran Terpadu
            </h2>
            <p className="text-xs text-[#64746A]">
              Isikan data diri, data akademik, dan unggah berkas CV Anda di bawah ini.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Bagian A: Identitas & Akun */}
            <GlassCard className="p-6 sm:p-8 flex flex-col gap-5 border-white/60">
              <h3 className="text-sm font-bold text-[#1A201C] border-b border-black/5 pb-2">
                Data Identitas & Akun
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nama Lengkap *"
                  placeholder="Nama Lengkap Anda"
                  error={errors.fullName?.message}
                  {...register("fullName")}
                />
                <Input
                  label="Nomor Induk Mahasiswa (NIM) *"
                  placeholder="102022530058"
                  error={errors.nim?.message}
                  {...register("nim")}
                />
                <Input
                  label="Email Institusi / Pribadi *"
                  type="email"
                  placeholder="nama@email.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
                {!isAuthenticated && (
                  <Input
                    label="Kata Sandi Akun (Baru) *"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    helperText="Akan digunakan untuk login ke portal kandidat nantinya."
                    error={errors.password?.message}
                    {...register("password")}
                  />
                )}
              </div>
            </GlassCard>

            {/* Bagian B: Akademik & Peminatan */}
            <GlassCard className="p-6 sm:p-8 flex flex-col gap-5 border-white/60">
              <h3 className="text-sm font-bold text-[#1A201C] border-b border-black/5 pb-2">
                Data Akademik & Peminatan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Universitas / Institut *"
                  placeholder="Nama Universitas Anda"
                  error={errors.universitas?.message}
                  {...register("universitas")}
                />
                <Input
                  label="Program Studi *"
                  placeholder="Teknik Informatika, Sistem Informasi, Elektro, dll"
                  error={errors.programStudi?.message}
                  {...register("programStudi")}
                />
                <Select
                  label="Pilihan Peran *"
                  options={[
                    { label: "Mahasiswa Riset (Publikasi & Algoritma)", value: "RISET" },
                    { label: "Mahasiswa Magang (Pengembangan Produk & IoT)", value: "MAGANG" },
                  ]}
                  {...register("roleInterest")}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="IPK Terakhir"
                    type="number"
                    step="0.01"
                    placeholder="3.80"
                    error={errors.ipk?.message}
                    {...register("ipk", { valueAsNumber: true })}
                  />
                  <Input
                    label="Semester"
                    type="number"
                    placeholder="5"
                    error={errors.semester?.message}
                    {...register("semester", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <Input
                label="Tautan Portofolio / GitHub / Karya *"
                placeholder="https://github.com/username atau https://linkedin.com/..."
                error={errors.portfolioUrl?.message}
                {...register("portfolioUrl")}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#274432]/80 ml-2">
                  Pengalaman Singkat / Deskripsi Riset (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ceritakan proyek teknologi, karya, atau minat riset yang pernah Anda geluti..."
                  className="w-full bg-[#F5F7EC]/60 focus:bg-[#F5F7EC]/90 border border-black/5 focus:border-[#274432]/40 rounded-2xl p-4 text-sm text-[#1A201C] outline-none transition-all duration-200 backdrop-blur-sm placeholder:text-[#64746A]/70 shadow-inner"
                  {...register("pengalaman")}
                />
              </div>
            </GlassCard>

            {/* Bagian C: Unggah Dokumen PDF */}
            <GlassCard className="p-6 sm:p-8 flex flex-col gap-5 border-white/60">
              <h3 className="text-sm font-bold text-[#1A201C] border-b border-black/5 pb-2">
                Unggah Berkas Dokumen (PDF Maks 5MB)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Dropzone
                  label="Kurikulum Vitae (CV) *"
                  helperText="Format PDF, ukuran maksimal 5MB"
                  onFileSelect={(file) => setCvFile(file)}
                />
                <Dropzone
                  label="Transkrip Nilai (Opsional)"
                  helperText="Format PDF, ukuran maksimal 5MB"
                  onFileSelect={(file) => setTranskripFile(file)}
                />
              </div>
            </GlassCard>

            {/* Tombol Kirim */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/">
                <Button variant="secondary" type="button">
                  Batal
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Kirimkan Pendaftaran Sekarang
              </Button>
            </div>
          </form>
        </div>

        {/* Section 4: Alur Timeline & FAQ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <GlassCard className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#274432]" />
              <h3 className="text-sm font-bold text-[#1A201C]">
                Tahapan Alur Seleksi
              </h3>
            </div>
            <ol className="text-xs text-[#64746A] flex flex-col gap-3 pl-2">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#274432]">1.</span>
                <span><strong>Pendaftaran & Berkas:</strong> Pengisian data diri, portofolio, dan unggah CV PDF.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#274432]">2.</span>
                <span><strong>Seleksi Berkas:</strong> Verifikasi kualifikasi akademik dan portofolio oleh PIC Lab.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#274432]">3.</span>
                <span><strong>Wawancara & Diskusi Riset:</strong> Sesi pendalaman minat riset dan komitmen lab.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#274432]">4.</span>
                <span><strong>Pengumuman & Penugasan:</strong> Kandidat diterima akan diberikan assigned project resmi.</span>
              </li>
            </ol>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#274432]" />
              <h3 className="text-sm font-bold text-[#1A201C]">
                Pertanyaan Umum (FAQ)
              </h3>
            </div>
            <div className="flex flex-col gap-3 text-xs text-[#64746A]">
              <div>
                <span className="font-bold text-[#1A201C] block">Apakah boleh mendaftar jika belum semester 5?</span>
                <span>Ya, mahasiswa semester berapapun yang memiliki motivasi riset dipersilakan mendaftar.</span>
              </div>
              <div>
                <span className="font-bold text-[#1A201C] block">Bagaimana jika batch reguler sedang ditutup?</span>
                <span>Anda tetap dapat mengirimkan berkas melalui jalur prioritas Golden Candidate kapan saja.</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

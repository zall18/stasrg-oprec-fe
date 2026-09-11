"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth.store";
import { Logo } from "@/components/ui/logo";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Menu,
  X,
} from "lucide-react";

export default function RekrutmenPage() {
  const router = useRouter();
  const { isAuthenticated, user, loadFromStorage } = useAuthStore();
  const [oprecStatus, setOprecStatus] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadFromStorage();
    api.getOprecStatus().then((res) => {
      setOprecStatus(res.data?.data);
    }).catch(() => {});
  }, [loadFromStorage]);

  const isBatchActive = Boolean(
    oprecStatus?.isOprecActive ?? oprecStatus?.isActive ?? false
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F4F0] text-[#1A201C]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 sm:py-4 backdrop-blur-md bg-white/40 border-b border-white/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo size="md" subtitle="Panduan & Pendaftaran" />
          </Link>
          {/* Desktop Nav Items */}
          <div className="hidden sm:flex items-center gap-3">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 rounded-2xl bg-white/70 hover:bg-white text-[#1A201C] border border-black/5 shadow-xs"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-black/5 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="px-4 py-2.5 rounded-2xl hover:bg-white/60 text-xs font-semibold text-[#1A201C]">
                ← Beranda Utama
              </div>
            </Link>
            {oprecStatus?.isGoldenCandidateActive && (
              <Link href="/golden-candidate" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="px-4 py-2.5 rounded-2xl bg-amber-50/70 border border-amber-500/20 text-xs font-bold text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Jalur Golden Candidate</span>
                </div>
              </Link>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/5">
              {isAuthenticated ? (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="col-span-2">
                  <Button variant="primary" size="sm" className="w-full text-xs">
                    Buka Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full text-xs">
                      Registrasi
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8 flex flex-col items-center text-center gap-4 sm:gap-6">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-2xl sm:rounded-full bg-white/60 border border-white/60 shadow-xs text-xs font-semibold max-w-full">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Informasi Resmi Rekrutmen Laboratorium STAS-RG</span>
          <Badge variant={isBatchActive ? "DITERIMA" : "PENDING"}>
            {isBatchActive ? "Batch Aktif Dibuka" : "Pendaftaran Ditutup"}
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight px-2">
          Panduan Lengkap Seleksi & Pendaftaran Kandidat
        </h1>
        <p className="text-xs sm:text-base text-[#64746A] max-w-2xl leading-relaxed">
          Pelajari peran riset, persyaratan berkas, alur tahapan seleksi, dan
          tata cara pendaftaran melalui Portal Resmi Kandidat STAS-RG.
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
              Pendaftaran resmi dilakukan melalui Portal Kandidat setelah Anda masuk (login).
            </p>
          </div>

          <GlassCard className="p-6 sm:p-10 flex flex-col items-center text-center gap-6 border-white/60 bg-white/70 shadow-md">
            <div className="w-16 h-16 rounded-3xl bg-[#274432]/10 flex items-center justify-center text-[#274432] shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-2 max-w-xl">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#1A201C]">
                Pendaftaran Wajib Melalui Portal Kandidat
              </h3>
              <p className="text-xs sm:text-sm text-[#64746A] leading-relaxed">
                Untuk menjaga keamanan akun, keabsahan berkas (CV & Transkrip), serta memantau progres seleksi secara transparan, seluruh pengisian data dan pengunggahan berkas dilakukan di dalam <strong>Portal Kandidat</strong>.
              </p>
            </div>

            {/* 3 Simple Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left py-2">
              <div className="p-4 rounded-2xl bg-white/50 border border-black/5 flex flex-col gap-1.5">
                <span className="w-6 h-6 rounded-full bg-[#274432] text-white text-xs font-bold flex items-center justify-center">1</span>
                <span className="text-xs font-bold text-[#1A201C]">Masuk / Buat Akun</span>
                <p className="text-[11px] text-[#64746A]">Login ke akun Anda atau registrasi akun baru jika belum terdaftar.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/50 border border-black/5 flex flex-col gap-1.5">
                <span className="w-6 h-6 rounded-full bg-[#274432] text-white text-xs font-bold flex items-center justify-center">2</span>
                <span className="text-xs font-bold text-[#1A201C]">Lengkapi Profil</span>
                <p className="text-[11px] text-[#64746A]">Isi data diri, akademik, dan unggah berkas CV PDF di menu Profil Saya.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/50 border border-black/5 flex flex-col gap-1.5">
                <span className="w-6 h-6 rounded-full bg-[#274432] text-white text-xs font-bold flex items-center justify-center">3</span>
                <span className="text-xs font-bold text-[#1A201C]">Kirimkan Pendaftaran</span>
                <p className="text-[11px] text-[#64746A]">Ajukan pendaftaran pada batch aktif dan pantau jadwal wawancara Anda.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
              {isAuthenticated ? (
                <Link href="/dashboard/oprec" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto justify-center px-8"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Buka Pendaftaran di Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto justify-center px-8"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Login untuk Mendaftar
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto justify-center px-6"
                    >
                      Belum Punya Akun? Registrasi
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </GlassCard>
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

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Award,
  CheckCircle,
  CheckCircle2,
  FileCheck,
  Menu,
  X,
  Cpu,
  Radio,
  Eye,
  Car,
  Compass,
  Layers,
  ChevronRight,
  BookOpen,
  Users,
  Target,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface OprecStatus {
  isActive?: boolean;
  isOprecActive?: boolean;
  isGoldenCandidateActive?: boolean;
  allowGoldenCandidate?: boolean;
  currentBatch?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export default function HomePage() {
  const [oprecStatus, setOprecStatus] = useState<OprecStatus | null>(null);
  const [announcements, setAnnouncements] = useState<
    Array<{ id: string; title: string; content: string }>
  >([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    api
      .getOprecStatus()
      .then((res) => {
        if (res.data?.data) {
          setOprecStatus(res.data.data);
        }
      })
      .catch(() => {
        setOprecStatus({
          isOprecActive: false,
          isActive: false,
          currentBatch: "",
          description: "Pendaftaran sedang ditutup",
        });
      })
      .finally(() => setIsLoadingStatus(false));

    api
      .getAnnouncements()
      .then((res) => {
        if (Array.isArray(res.data?.data)) {
          setAnnouncements(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const isClient = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isOprecExpired = Boolean(
    isClient &&
      oprecStatus?.endDate &&
      new Date(oprecStatus.endDate).getTime() < Date.now()
  );

  const isOprecActive = Boolean(
    (oprecStatus?.isOprecActive ?? oprecStatus?.isActive ?? false) &&
      !isOprecExpired
  );
  const isGoldenActive = Boolean(
    !isOprecActive && Boolean(oprecStatus?.isGoldenCandidateActive)
  );
  const isAnyActive = isOprecActive || isGoldenActive;

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#274432] selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 sm:py-4 backdrop-blur-md bg-white/60 border-b border-white/60 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo size="md" subtitle="Research Group" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 sm:gap-2">
            <a
              href="#tentang"
              className="text-xs font-semibold text-[#64746A] hover:text-[#1A201C] px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors"
            >
              Tentang STAS-RG
            </a>
            <a
              href="#penelitian"
              className="text-xs font-semibold text-[#64746A] hover:text-[#1A201C] px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors"
            >
              Fokus Riset
            </a>
            <a
              href="#roles"
              className="text-xs font-semibold text-[#64746A] hover:text-[#1A201C] px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors"
            >
              Divisi & Roles
            </a>

            {isOprecActive && (
              <Link href="/rekrutmen">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                >
                  Panduan Berkas
                </Button>
              </Link>
            )}

            {isGoldenActive && (
              <Link href="/golden-candidate">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-amber-800 hover:text-amber-900 font-semibold"
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-600" />}
                >
                  Jalur Golden
                </Button>
              </Link>
            )}

            <div className="h-4 w-[1px] bg-black/10 mx-1" />

            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Masuk
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Buat Akun
              </Button>
            </Link>
          </nav>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-2xl bg-white/70 hover:bg-white text-[#1A201C] border border-black/5 shadow-xs transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-black/5 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <a
              href="#tentang"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#1A201C] hover:bg-white/60 rounded-xl"
            >
              Tentang STAS-RG
            </a>
            <a
              href="#penelitian"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#1A201C] hover:bg-white/60 rounded-xl"
            >
              Fokus Riset
            </a>
            <a
              href="#roles"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#1A201C] hover:bg-white/60 rounded-xl"
            >
              Divisi & Roles
            </a>

            {isOprecActive && (
              <Link
                href="/rekrutmen"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl hover:bg-white/60 text-xs font-semibold text-[#1A201C] transition-colors">
                  <FileCheck className="w-4 h-4 text-[#274432]" />
                  <span>Panduan Berkas</span>
                </div>
              </Link>
            )}

            {isGoldenActive && (
              <Link
                href="/golden-candidate"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-50/70 border border-amber-500/20 text-xs font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Jalur Golden Candidate</span>
                </div>
              </Link>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/5">
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Masuk
                </Button>
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button variant="primary" size="sm" className="w-full text-xs">
                  Buat Akun
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center gap-16 sm:gap-24 pb-20">
        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 sm:pt-20 flex flex-col items-center gap-8 sm:gap-12 text-center">
          {/* Banner Status */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 px-4 py-2 rounded-full bg-white/70 border border-white/80 shadow-xs backdrop-blur-md max-w-full">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  isAnyActive ? "bg-emerald-400" : "bg-gray-400"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex rounded-full h-2.5 w-2.5",
                  isAnyActive ? "bg-emerald-600" : "bg-gray-500"
                )}
              />
            </span>
            <span className="text-xs font-semibold text-[#1A201C]">
              {isLoadingStatus
                ? "Memeriksa periode pendaftaran..."
                : isOprecActive
                ? `Oprec Reguler Dibuka: ${oprecStatus?.currentBatch || "Batch Aktif"}`
                : isGoldenActive
                ? `Jalur Golden Candidate Dibuka: ${oprecStatus?.currentBatch || "Batch Aktif"}`
                : "Semua Jalur Pendaftaran Sedang Ditutup"}
            </span>
          </div>

          {/* Announcement Banner if present */}
          {announcements.length > 0 && (
            <div className="w-full max-w-3xl -mt-2 p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-600/20 text-xs text-[#274432] font-medium flex flex-col sm:flex-row items-center justify-center gap-2 shadow-xs">
              <span className="font-bold uppercase tracking-wider text-[10px] bg-[#274432] text-white px-2 py-0.5 rounded-full shrink-0">
                Pengumuman
              </span>
              <span className="truncate">
                <strong>{announcements[0].title}</strong> — {announcements[0].content}
              </span>
            </div>
          )}

          {/* Heading */}
          <div className="flex flex-col gap-4 sm:gap-6 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1A201C] leading-[1.15]">
              Membangun Masa Depan Bersama{" "}
              <span className="text-[#274432] underline decoration-emerald-600/30">
                STAS-RG
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-[#64746A] leading-relaxed max-w-2xl mx-auto">
              Smart Transportation & Autonomous Systems Research Group (STAS-RG)
              membuka kesempatan bagi mahasiswa untuk terjun langsung dalam penelitian
              teknologi otonom, kecerdasan buatan, dan mobilitas pintar masa depan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full">
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto justify-center shadow-xl shadow-emerald-900/15"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Login untuk Mendaftar
                </Button>
              </Link>
              {isGoldenActive ? (
                <Link href="/golden-candidate" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto justify-center text-amber-900 border-amber-500/20 bg-amber-50/70 hover:bg-amber-100"
                    leftIcon={<Sparkles className="w-4 h-4 text-amber-600" />}
                  >
                    Pelajari Jalur Golden
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto justify-center bg-white/70"
                  >
                    Daftar Akun Baru
                  </Button>
                </Link>
              )}
            </div>
            <span className="text-xs text-[#64746A]">
              * Buat akun dan masuk ke portal kandidat untuk melengkapi berkas & memilih jalur seleksi.
            </span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-4">
            <div className="p-4 rounded-2xl bg-white/50 border border-white/60 flex flex-col items-center">
              <span className="text-2xl font-extrabold text-[#274432]">15+</span>
              <span className="text-xs text-[#64746A]">Publikasi Ilmiah Bereputasi</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/50 border border-white/60 flex flex-col items-center">
              <span className="text-2xl font-extrabold text-[#274432]">4 Fokus</span>
              <span className="text-xs text-[#64746A]">Klaster Riset Utama</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/50 border border-white/60 flex flex-col items-center">
              <span className="text-2xl font-extrabold text-[#274432]">10+</span>
              <span className="text-xs text-[#64746A]">Kolaborasi & Proyek Industri</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/50 border border-white/60 flex flex-col items-center">
              <span className="text-2xl font-extrabold text-[#274432]">100%</span>
              <span className="text-xs text-[#64746A]">Mentoring Terstruktur</span>
            </div>
          </div>
        </section>

        {/* SECTION 1: PENJELASAN STAS-RG */}
        <section id="tentang" className="max-w-6xl w-full mx-auto px-4 sm:px-8 scroll-mt-24">
          <GlassCard className="p-6 sm:p-12 flex flex-col gap-8 border-white/60 bg-gradient-to-br from-white/80 to-white/40 shadow-xl">
            <div className="flex flex-col gap-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#274432] flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                Mengenal STAS-RG
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A201C] tracking-tight">
                Pusat Riset Transportasi Cerdas & Sistem Otonom
              </h2>
              <p className="text-xs sm:text-sm text-[#64746A] leading-relaxed">
                Smart Transportation & Autonomous Systems Research Group (STAS-RG) adalah
                laboratorium penelitian interdisipliner yang mewadahi akademisi dan mahasiswa
                untuk memecahkan tantangan mobilitas modern melalui rekayasa perangkat lunak,
                kecerdasan buatan, sensor fusi, dan robotika kendaraan otonom.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white/60 border border-black/5 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#274432] flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#1A201C]">Inovasi Eksploratif</h3>
                <p className="text-xs text-[#64746A] leading-relaxed">
                  Kami menguji batas algoritma artificial intelligence mulai dari computer vision hingga deep reinforcement learning untuk kendali sistem otonom.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/60 border border-black/5 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#1A201C]">Implementasi Nyata</h3>
                <p className="text-xs text-[#64746A] leading-relaxed">
                  Bukan sekadar simulasi di atas kertas—kami merakit prototipe fisik, memanfaatkan sensor LiDAR, kamera industri, dan sistem komputasi Edge.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/60 border border-black/5 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#1A201C]">Kaderisasi Talenta</h3>
                <p className="text-xs text-[#64746A] leading-relaxed">
                  Anggota lab dibimbing secara berkala oleh Principal Investigator dan peneliti senior, membuka jalan menuju publikasi scopus dan karier profesional.
                </p>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* SECTION 2: SHOW PENELITIAN & RISET UNGGULAN */}
        <section id="penelitian" className="max-w-6xl w-full mx-auto px-4 sm:px-8 flex flex-col gap-8 scroll-mt-24">
          <div className="flex flex-col gap-2 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#274432] flex items-center justify-center gap-1.5">
              <Cpu className="w-4 h-4" />
              Klaster & Portofolio Penelitian
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A201C] tracking-tight">
              Topik Riset yang Dikembangkan di Lab
            </h2>
            <p className="text-xs sm:text-sm text-[#64746A]">
              Jelajahi bidang riset aktif yang dapat Anda pilih sebagai topik tugas akhir, riset kompetisi, atau proyek magang di STAS-RG.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Research 1 */}
            <GlassCard className="p-6 sm:p-7 flex flex-col justify-between gap-4 border-white/60 hover:shadow-lg transition-all group">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-[#274432] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Car className="w-6 h-6" />
                  </div>
                  <Badge variant="DEFAULT">Autonomous Tech</Badge>
                </div>
                <h3 className="text-lg font-bold text-[#1A201C]">
                  Autonomous Vehicle Navigation & Motion Planning
                </h3>
                <p className="text-xs text-[#64746A] leading-relaxed">
                  Pengembangan algoritma navigasi cerdas, estimasi lintasan aman (trajectory generation), dan integrasi simulator CARLA / ROS 2 untuk armada kendaraan otonom mini maupun skala penuh.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-black/5 text-[11px] font-semibold text-[#274432]">
                <span className="bg-[#274432]/10 px-2 py-0.5 rounded-full">ROS 2</span>
                <span className="bg-[#274432]/10 px-2 py-0.5 rounded-full">CARLA Simulator</span>
                <span className="bg-[#274432]/10 px-2 py-0.5 rounded-full">Path Planning</span>
                <span className="bg-[#274432]/10 px-2 py-0.5 rounded-full">LiDAR SLAM</span>
              </div>
            </GlassCard>

            {/* Research 2 */}
            <GlassCard className="p-6 sm:p-7 flex flex-col justify-between gap-4 border-white/60 hover:shadow-lg transition-all group">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Eye className="w-6 h-6" />
                  </div>
                  <Badge variant="DEFAULT">Computer Vision</Badge>
                </div>
                <h3 className="text-lg font-bold text-[#1A201C]">
                  Deep Learning Perception & Sensor Fusion
                </h3>
                <p className="text-xs text-[#64746A] leading-relaxed">
                  Deteksi objek pejalan kaki dan kendaraan pada kondisi cuaca ekstrem, segmentasi semantik jalan raya, serta fusi data optik kamera dengan sensor LiDAR 3D berkecepatan tinggi.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-black/5 text-[11px] font-semibold text-blue-800">
                <span className="bg-blue-500/10 px-2 py-0.5 rounded-full">YOLOv8 / Transformer</span>
                <span className="bg-blue-500/10 px-2 py-0.5 rounded-full">Point Cloud 3D</span>
                <span className="bg-blue-500/10 px-2 py-0.5 rounded-full">Sensor Fusion</span>
                <span className="bg-blue-500/10 px-2 py-0.5 rounded-full">PyTorch</span>
              </div>
            </GlassCard>

            {/* Research 3 */}
            <GlassCard className="p-6 sm:p-7 flex flex-col justify-between gap-4 border-white/60 hover:shadow-lg transition-all group">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Radio className="w-6 h-6" />
                  </div>
                  <Badge variant="DEFAULT">Connected Vehicles</Badge>
                </div>
                <h3 className="text-lg font-bold text-[#1A201C]">
                  V2X (Vehicle-to-Everything) & Smart Mobility IoT
                </h3>
                <p className="text-xs text-[#64746A] leading-relaxed">
                  Protokol komunikasi nirkabel latensi rendah antar kendaraan dan infrastruktur jalan raya (V2I/V2V), telemetri armada real-time, dan pemetaan cerdas mobilitas perkotaan.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-black/5 text-[11px] font-semibold text-purple-800">
                <span className="bg-purple-500/10 px-2 py-0.5 rounded-full">V2X Protocol</span>
                <span className="bg-purple-500/10 px-2 py-0.5 rounded-full">MQTT & WebSocket</span>
                <span className="bg-purple-500/10 px-2 py-0.5 rounded-full">Fleet Telematics</span>
                <span className="bg-purple-500/10 px-2 py-0.5 rounded-full">Edge Gateway</span>
              </div>
            </GlassCard>

            {/* Research 4 */}
            <GlassCard className="p-6 sm:p-7 flex flex-col justify-between gap-4 border-white/60 hover:shadow-lg transition-all group">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <Badge variant="DEFAULT">Intelligent Systems</Badge>
                </div>
                <h3 className="text-lg font-bold text-[#1A201C]">
                  Intelligent Transportation Systems (ITS) & Edge AI
                </h3>
                <p className="text-xs text-[#64746A] leading-relaxed">
                  Sistem lampu lalu lintas adaptif berbasis kepadatan kendaraan nyata, prediksi kemacetan lalu lintas kota, serta komputasi hemat daya pada perangkat embedded (NVIDIA Jetson).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-black/5 text-[11px] font-semibold text-amber-900">
                <span className="bg-amber-500/10 px-2 py-0.5 rounded-full">NVIDIA Jetson</span>
                <span className="bg-amber-500/10 px-2 py-0.5 rounded-full">Adaptive Traffic</span>
                <span className="bg-amber-500/10 px-2 py-0.5 rounded-full">TensorRT</span>
                <span className="bg-amber-500/10 px-2 py-0.5 rounded-full">Edge Computing</span>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* SECTION 3: ROLES & DIVISI REKRUTMEN */}
        <section id="roles" className="max-w-6xl w-full mx-auto px-4 sm:px-8 flex flex-col gap-8 scroll-mt-24">
          <div className="flex flex-col gap-2 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#274432] flex items-center justify-center gap-1.5">
              <Users className="w-4 h-4" />
              Pilihan Peran & Jalur Seleksi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A201C] tracking-tight">
              Temukan Posisi yang Sesuai dengan Target Anda
            </h2>
            <p className="text-xs sm:text-sm text-[#64746A]">
              Pilih antara fokus akademis (Riset), pengembangan implementasi (Magang), atau ajukan portofolio unggulan melalui Golden Ticket.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            {/* Card 1: Riset */}
            <GlassCard
              className={cn(
                "p-7 flex flex-col justify-between gap-5 hover:shadow-lg transition-all",
                isGoldenActive && "opacity-90"
              )}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  {isOprecActive && <Badge variant="DITERIMA">Batch Aktif</Badge>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg font-bold text-[#1A201C]">
                    Mahasiswa Riset
                  </h3>
                  <p className="text-xs text-[#64746A] leading-relaxed">
                    Fokus pada eksplorasi ilmiah, rancang bangun algoritma baru,
                    pemodelan matematis, dan publikasi penelitian di konferensi serta
                    jurnal nasional maupun internasional bereputasi.
                  </p>
                </div>
              </div>

              <ul className="text-xs text-[#1A201C] flex flex-col gap-2 pt-3 border-t border-black/5">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Bimbingan penulisan paper & konferensi ilmiah</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Akses penuh ke server komputasi & sensor lab</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Peluang percepatan Tugas Akhir / Skripsi</span>
                </li>
              </ul>
            </GlassCard>

            {/* Card 2: Magang */}
            <GlassCard
              className={cn(
                "p-7 flex flex-col justify-between gap-5 hover:shadow-lg transition-all",
                isGoldenActive && "opacity-90"
              )}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  {isOprecActive && <Badge variant="DITERIMA">Batch Aktif</Badge>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg font-bold text-[#1A201C]">
                    Mahasiswa Magang
                  </h3>
                  <p className="text-xs text-[#64746A] leading-relaxed">
                    Fokus pada implementasi software engineering, integrasi IoT,
                    pengembangan dashboard web/mobile, dan penerapan solusi nyata ke dalam
                    proyek industri mitra laboratorium.
                  </p>
                </div>
              </div>

              <ul className="text-xs text-[#1A201C] flex flex-col gap-2 pt-3 border-t border-black/5">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Portofolio proyek nyata skala industri</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Konversi SKS magang kampus & sertifikat</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Mentoring langsung dengan software engineer lab</span>
                </li>
              </ul>
            </GlassCard>

            {/* Card 3: Golden Candidate */}
            <GlassCard
              variant="tinted"
              className={cn(
                "p-7 flex flex-col justify-between gap-5 border-amber-500/30 hover:shadow-lg transition-all",
                "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white/60",
                isGoldenActive &&
                  "ring-2 ring-amber-500/50 bg-amber-500/15 shadow-md"
              )}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-900">
                    <Award className="w-6 h-6" />
                  </div>
                  <Badge variant="GOLDEN">
                    {isGoldenActive ? "Jalur Terbuka" : "Jalur Prioritas"}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg font-bold text-[#1A201C] flex items-center gap-1.5">
                    Golden Candidate
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </h3>
                  <p className="text-xs text-[#5C5542] leading-relaxed">
                    Jalur eksklusif bagi mahasiswa dengan portofolio luar biasa,
                    prestasi lomba nasional/internasional, atau rekam jejak riset
                    untuk penugasan proyek lab secara langsung.
                  </p>
                </div>
              </div>

              <ul className="text-xs text-[#1A201C] flex flex-col gap-2 pt-3 border-t border-amber-500/20">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span><strong>Fast-track Review</strong> oleh Principal Investigator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Wawancara khusus berbasis karya & portofolio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Prioritas penempatan ke proyek riset unggulan</span>
                </li>
              </ul>
            </GlassCard>
          </div>
        </section>

        {/* SECTION 4: CALL TO ACTION BOTTOM */}
        <section className="max-w-6xl w-full mx-auto px-4 sm:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#274432] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col gap-2 max-w-xl text-center md:text-left z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Mulai Perjalanan Anda
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Siap Bergabung dengan Laboratorium STAS-RG?
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                Buat akun sekarang, siapkan berkas wajib (CV, Transkrip, KSM, EPRT, LinkedIn), dan kirimkan pendaftaran Anda sebelum batas waktu berakhir.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full sm:w-auto">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto justify-center bg-white text-emerald-950 font-bold hover:bg-emerald-50"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Daftar Sekarang
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto justify-center border-white/30 text-white hover:bg-white/10"
                >
                  Masuk Akun
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 sm:px-8 py-8 border-t border-black/5 bg-white/40 backdrop-blur-xs text-xs text-[#64746A]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <p>© {new Date().getFullYear()} STAS-RG Lab. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a href="#tentang" className="hover:text-[#1A201C] py-1">
              Tentang Kami
            </a>
            <a href="#penelitian" className="hover:text-[#1A201C] py-1">
              Fokus Riset
            </a>
            <a href="#roles" className="hover:text-[#1A201C] py-1">
              Divisi
            </a>
            {isOprecActive && (
              <Link href="/rekrutmen" className="hover:text-[#1A201C] py-1">
                Panduan Berkas
              </Link>
            )}
            {isGoldenActive && (
              <Link
                href="/golden-candidate"
                className="hover:text-[#1A201C] py-1"
              >
                Panduan Golden Candidate
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

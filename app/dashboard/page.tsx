"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth.store";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ProgressStepper,
  GoldenProgressStepper,
  SelectionStatus,
} from "@/components/ui/progress-stepper";
import {
  UserCheck,
  AlertTriangle,
  ArrowRight,
  FileText,
  Sparkles,
  Rocket,
  Calendar,
  History,
  CheckCircle2,
  HelpCircle,
  Award,
  BookOpen,
  Briefcase,
  ChevronRight,
  Clock,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CandidateDashboardPage() {
  const { user } = useAuthStore();

  const {
    data: profileData,
    isLoading: isLoadingProfile,
  } = useQuery({
    queryKey: ["candidateProfile"],
    queryFn: async () => {
      const res = await api.getCandidateProfile();
      return res.data?.data;
    },
  });

  // Query latest registrations
  const { data: registrationsData } = useQuery({
    queryKey: ["candidateRegistrations"],
    queryFn: async () => {
      try {
        const res = await api.getRegistrationsHistory();
        return Array.isArray(res.data?.data) ? res.data.data : [];
      } catch {
        return [];
      }
    },
  });

  // Query candidate golden application
  const { data: goldenAppData } = useQuery({
    queryKey: ["candidateGoldenApp"],
    queryFn: async () => {
      try {
        const res = await api.getGoldenApplication();
        return res.data?.data;
      } catch {
        return null;
      }
    },
  });

  // Query candidate interviews
  const { data: interviewsData } = useQuery({
    queryKey: ["candidateInterviews"],
    queryFn: async () => {
      try {
        const res = await api.getCandidateInterviews();
        return Array.isArray(res.data?.data) ? res.data.data : [];
      } catch {
        return [];
      }
    },
  });

  const profile = profileData;
  const isProfileComplete = Boolean(
    profile?.fullName &&
    profile?.nim &&
    profile?.cvUrl &&
    profile?.transkripUrl &&
    profile?.ksmUrl &&
    profile?.eprtUrl &&
    profile?.linkedinUrl
  );

  const latestRegistration =
    registrationsData && registrationsData.length > 0
      ? registrationsData[0]
      : null;

  const currentSelectionStatus: SelectionStatus =
    (latestRegistration?.status as SelectionStatus) ||
    (profile?.status as SelectionStatus) ||
    "PENDING";

  const upcomingInterview = interviewsData?.find(
    (i: any) =>
      i.status === "SCHEDULED" ||
      i.status === "CONFIRMED" ||
      i.status === "RESCHEDULE_REQUESTED" ||
      i.status === "RESCHEDULE_REJECTED"
  );

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto">
      {/* 1. SECTION PALING ATAS: GREETING & PILIHAN JALUR PENDAFTARAN UTAMA */}
      <div className="flex flex-col gap-4">
        {/* Top Greeting & Profil Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#274432] bg-[#274432]/10 px-2.5 py-0.5 rounded-full">
                Portal Rekrutmen STAS-RG
              </span>
              {isProfileComplete ? (
                <Badge variant="DITERIMA">✓ Berkas Lengkap</Badge>
              ) : (
                <Badge variant="PENDING">⚠️ Berkas Belum Lengkap</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A201C]">
              Halo, {profile?.fullName || user?.email || "Kandidat"}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#64746A] mt-0.5">
              Pilih salah satu jalur pendaftaran di bawah ini sesuai kualifikasi dan pengalaman Anda untuk memulai proses seleksi.
            </p>
          </div>

          <Link href="/dashboard/profile" className="shrink-0 w-full sm:w-auto">
            <Button
              variant={isProfileComplete ? "outline" : "primary"}
              size="sm"
              className={cn(
                "w-full sm:w-auto text-xs shadow-sm font-semibold justify-center",
                !isProfileComplete && "bg-[#274432] hover:bg-[#1e3426] text-white shadow-emerald-950/10 font-bold"
              )}
              rightIcon={!isProfileComplete ? <ArrowRight className="w-3.5 h-3.5" /> : undefined}
              leftIcon={isProfileComplete ? <FileText className="w-3.5 h-3.5" /> : undefined}
            >
              {isProfileComplete ? "Edit Berkas Profil" : "Lengkapi Berkas Wajib"}
            </Button>
          </Link>
        </div>

        {/* Warning Banner jika berkas wajib belum lengkap */}
        {!isProfileComplete && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Penting:</strong> Pastikan Anda telah melengkapi data diri dan mengunggah berkas wajib (CV, Transkrip, KSM, EPRT, & LinkedIn) di profil agar pendaftaran dapat divalidasi.
              </span>
            </div>
            <Link href="/dashboard/profile" className="shrink-0 font-bold text-amber-900 underline hover:text-amber-950">
              Lengkapi Sekarang →
            </Link>
          </div>
        )}

        {/* 2 KARTU JALUR UTAMA (GOLDEN TICKET & REGULER OPREC) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* CARD 1: JALUR GOLDEN TICKET (HIGH PRIORITY & PROMINENT) */}
          <div
            className={cn(
              "relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-6 transition-all duration-300",
              "bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-white/70",
              "border-2 border-amber-500/30 hover:border-amber-500/60 shadow-xl shadow-amber-900/5",
              goldenAppData?.id && "ring-2 ring-amber-500/40 bg-amber-50/60"
            )}
          >
            {/* Top Tag & Sparkle */}
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" style={{ animationDuration: "4s" }} />
                JALUR GOLDEN TICKET
              </span>
              {goldenAppData?.id && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Status: {goldenAppData.status || "PENDING"}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-extrabold text-[#1A201C] flex items-center gap-2">
                Jalur Prestasi & Portofolio Khusus
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5542] leading-relaxed">
                Punya pengalaman proyek teknologi, prestasi lomba, atau riset yang sudah terbukti? 
                Jalur Golden Ticket memberikan akses prioritas penugasan proyek lab secara langsung.
              </p>

              {/* Perks Checklist */}
              <div className="grid grid-cols-1 gap-2 pt-2 border-t border-amber-500/15">
                <div className="flex items-center gap-2 text-xs text-[#3E3827]">
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                  <span><strong>Fast-track Review</strong> oleh Principal Investigator Lab</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#3E3827]">
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                  <span><strong>Prioritas Penugasan</strong> pada proyek riset industri</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#3E3827]">
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Wawancara khusus berbasis portofolio dan karya Anda</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link href="/dashboard/golden-candidate" className="w-full">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold shadow-lg shadow-amber-700/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {goldenAppData?.id
                    ? "Pantau Aplikasi Golden Ticket Anda"
                    : "Daftar Jalur Golden Ticket Sekarang"}
                </Button>
              </Link>
            </div>
          </div>

          {/* CARD 2: JALUR REGULER (OPEN RECRUITMENT) */}
          <div
            className={cn(
              "relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-6 transition-all duration-300",
              "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white/70",
              "border-2 border-emerald-600/30 hover:border-emerald-600/60 shadow-xl shadow-emerald-900/5",
              latestRegistration && "ring-2 ring-emerald-600/40 bg-emerald-50/50"
            )}
          >
            {/* Top Tag */}
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#274432] text-white shadow-sm tracking-wide">
                <Rocket className="w-3.5 h-3.5 text-emerald-300" />
                JALUR REGULER (OPREC)
              </span>
              {latestRegistration && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Batch: {latestRegistration.batchName || "Aktif"}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-extrabold text-[#1A201C] flex items-center gap-2">
                Open Recruitment Batch Umum
              </h3>
              <p className="text-xs sm:text-sm text-[#4A5D52] leading-relaxed">
                Terbuka bagi seluruh mahasiswa aktif yang ingin belajar, berkembang, dan 
                berkontribusi langsung di divisi <strong>Riset</strong> maupun <strong>Magang</strong>.
              </p>

              {/* Perks Checklist */}
              <div className="grid grid-cols-1 gap-2 pt-2 border-t border-emerald-600/15">
                <div className="flex items-center gap-2 text-xs text-[#203628]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Pilihan 2 divisi fokus: <strong>Mahasiswa Riset</strong> & <strong>Magang</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#203628]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Bimbingan intensif dan kurikulum terstruktur dari tim lab</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#203628]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Kesempatan konversi SKS perkuliahan dan publikasi riset</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link href="/dashboard/oprec" className="w-full">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center bg-[#274432] hover:bg-[#1e3426] text-white font-bold shadow-lg shadow-[#274432]/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {latestRegistration
                    ? "Cek Status Pendaftaran Reguler"
                    : "Pilih Batch & Daftar Sekarang"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NOTIFIKASI WAWANCARA (JIKA ADA JADWAL AKTIF) */}
      {upcomingInterview && (
        <div
          className={cn(
            "p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all",
            upcomingInterview.status === "RESCHEDULE_REJECTED"
              ? "bg-rose-700"
              : upcomingInterview.status === "RESCHEDULE_REQUESTED"
              ? "bg-amber-600"
              : "bg-emerald-700"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                {upcomingInterview.status === "RESCHEDULE_REJECTED"
                  ? "Permohonan Reschedule Ditolak"
                  : upcomingInterview.status === "RESCHEDULE_REQUESTED"
                  ? "Menunggu Konfirmasi Reschedule Admin"
                  : "Pemberitahuan Wawancara"}
              </span>
              <h4 className="text-sm font-bold">
                Jadwal:{" "}
                {new Date(upcomingInterview.datetime).toLocaleString("id-ID", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </h4>
              {upcomingInterview.picName && (
                <p className="text-xs opacity-90 mt-0.5">
                  PIC Pewawancara: <strong>{upcomingInterview.picName}</strong>
                </p>
              )}
            </div>
          </div>
          <Link href="/dashboard/interviews" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto justify-center bg-white text-[#1A201C] font-bold hover:bg-white/90 shadow-xs"
            >
              Lihat Detail & Atur Jadwal
            </Button>
          </Link>
        </div>
      )}

      {/* 3. STATUS SELEKSI AKTIF & PROGRESS STEPPER (JIKA SUDAH MENDAFTAR) */}
      {(goldenAppData?.id || latestRegistration) && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#64746A] uppercase tracking-wider px-1">
            Status Seleksi Aktif Anda
          </span>
          {goldenAppData?.id ? (
            <GoldenProgressStepper currentStatus={goldenAppData.status || "PENDING"} />
          ) : (
            <ProgressStepper currentStatus={currentSelectionStatus} />
          )}
        </div>
      )}

      {/* PANDUAN LANGKAH: APA YANG HARUS DILAKUKAN KANDIDAT? */}
      <GlassCard className="p-6 sm:p-8 flex flex-col gap-6 border-white/60">
        <div className="flex flex-col gap-1 border-b border-black/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#274432]/10 text-[#274432] flex items-center justify-center font-bold text-xs">
              ?
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#1A201C]">
              Panduan Langkah: Apa yang Harus Dilakukan Setelah Login?
            </h3>
          </div>
          <p className="text-xs text-[#64746A]">
            Ikuti 3 tahapan mudah berikut untuk memastikan berkas Anda terverifikasi dengan benar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-white/60 border border-black/5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-[#274432] text-white flex items-center justify-center font-extrabold text-xs">
                1
              </span>
              {isProfileComplete ? (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Selesai
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Wajib Diisi
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-[#1A201C]">
              Lengkapi Data Profil & Dokumen
            </h4>
            <p className="text-xs text-[#64746A] leading-relaxed">
              Isi data diri Anda dan unggah berkas wajib: <strong>CV</strong>, <strong>Transkrip Nilai</strong>, <strong>KSM</strong>, <strong>Sertifikat EPRT</strong>, serta tautan <strong>LinkedIn</strong>.
            </p>
            <Link href="/dashboard/profile" className="mt-auto pt-2">
              <span className="text-xs font-bold text-[#274432] hover:underline flex items-center gap-1">
                Buka Form Profil <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-white/60 border border-black/5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center font-extrabold text-xs">
                2
              </span>
              <span className="text-[11px] font-bold text-[#64746A] bg-black/5 px-2 py-0.5 rounded-full">
                Pilih Jalur
              </span>
            </div>
            <h4 className="font-bold text-sm text-[#1A201C]">
              Pilih Jalur yang Sesuai
            </h4>
            <p className="text-xs text-[#64746A] leading-relaxed">
              Jika punya portofolio unggul, ajukan <strong>Golden Ticket</strong>. Jika ingin seleksi umum bersama kandidat lain, ajukan pada <strong>Jalur Reguler (Oprec)</strong>.
            </p>
            <div className="mt-auto pt-2 flex items-center gap-3">
              <Link href="/dashboard/golden-candidate">
                <span className="text-xs font-bold text-amber-800 hover:underline">
                  Golden Ticket
                </span>
              </Link>
              <span className="text-[#64746A] text-xs">•</span>
              <Link href="/dashboard/oprec">
                <span className="text-xs font-bold text-emerald-800 hover:underline">
                  Jalur Reguler
                </span>
              </Link>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-white/60 border border-black/5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs">
                3
              </span>
              <span className="text-[11px] font-bold text-[#64746A] bg-black/5 px-2 py-0.5 rounded-full">
                Seleksi & Interview
              </span>
            </div>
            <h4 className="font-bold text-sm text-[#1A201C]">
              Pantau Pengumuman & Wawancara
            </h4>
            <p className="text-xs text-[#64746A] leading-relaxed">
              Cek portal ini secara berkala. Jika lolos berkas, jadwal wawancara akan muncul dan Anda dapat mengonfirmasi atau mengajukan reschedule jika ada kendala.
            </p>
            <Link href="/dashboard/interviews" className="mt-auto pt-2">
              <span className="text-xs font-bold text-blue-800 hover:underline flex items-center gap-1">
                Cek Jadwal Interview <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Tautan Cepat / Bottom Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/interviews">
          <GlassCard className="p-4.5 flex items-center justify-between hover:bg-white/80 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-700">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-[#1A201C]">Jadwal Wawancara</span>
                <span className="text-[11px] text-[#64746A]">
                  {interviewsData?.length ? `${interviewsData.length} jadwal terdaftar` : "Belum ada jadwal"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#64746A] group-hover:translate-x-0.5 transition-transform" />
          </GlassCard>
        </Link>

        <Link href="/dashboard/history">
          <GlassCard className="p-4.5 flex items-center justify-between hover:bg-white/80 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-700">
                <History className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-[#1A201C]">Riwayat Pendaftaran</span>
                <span className="text-[11px] text-[#64746A]">
                  {registrationsData?.length ? `${registrationsData.length} riwayat batch` : "Cek status pendaftaran"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#64746A] group-hover:translate-x-0.5 transition-transform" />
          </GlassCard>
        </Link>

        <Link href="/rekrutmen">
          <GlassCard className="p-4.5 flex items-center justify-between hover:bg-white/80 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-700">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-[#1A201C]">Panduan & Info Lab</span>
                <span className="text-[11px] text-[#64746A]">Kriteria berkas & alur seleksi</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#64746A] group-hover:translate-x-0.5 transition-transform" />
          </GlassCard>
        </Link>
      </div>
    </div>
  );
}

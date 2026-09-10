"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth.store";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressStepper, SelectionStatus } from "@/components/ui/progress-stepper";
import {
  UserCheck,
  AlertTriangle,
  ArrowRight,
  FileText,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Rocket,
  Calendar,
  History,
} from "lucide-react";

export default function CandidateDashboardPage() {
  const { user } = useAuthStore();

  const {
    data: profileData,
    isLoading,
    isError,
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
    profile?.fullName && profile?.nim && profile?.cvUrl
  );

  const latestRegistration = registrationsData && registrationsData.length > 0
    ? registrationsData[0]
    : null;

  const currentSelectionStatus: SelectionStatus =
    (latestRegistration?.status as SelectionStatus) ||
    (profile?.status as SelectionStatus) ||
    "PENDING";

  const upcomingInterview = interviewsData?.find(
    (i: any) => i.status === "SCHEDULED" || i.status === "CONFIRMED"
  );

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Welcome Banner */}
      <GlassCard className="p-5 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 border-white/60">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#274432]">
              Portal Kandidat STAS-RG
            </span>
            {isProfileComplete ? (
              <Badge variant="DITERIMA">Profil Lengkap</Badge>
            ) : (
              <Badge variant="PENDING">Profil Belum Lengkap</Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A201C]">
            Halo, {profile?.fullName || user?.email || "Kandidat"}!
          </h1>
          <p className="text-xs sm:text-sm text-[#64746A] max-w-xl">
            {isProfileComplete
              ? "Profil dan dokumen Anda telah tersimpan. Anda siap mengikuti tahapan seleksi Golden Candidate atau Open Recruitment."
              : "Lengkapi data profil dan berkas CV Anda agar PIC seleksi lab dapat meninjau kualifikasi Anda."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {!isProfileComplete ? (
            <Link href="/dashboard/profile" className="w-full sm:w-auto">
              <Button
                variant="primary"
                className="w-full sm:w-auto justify-center"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Lengkapi Profil Sekarang
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/profile" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto justify-center" leftIcon={<FileText className="w-4 h-4" />}>
                Perbarui Profil
              </Button>
            </Link>
          )}
        </div>
      </GlassCard>

      {/* Progress Stepper Tahapan Seleksi */}
      <ProgressStepper currentStatus={currentSelectionStatus} />

      {/* Interview Alert Banner if any upcoming interview */}
      {upcomingInterview && (
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-emerald-700 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                Pemberitahuan Wawancara
              </span>
              <h4 className="text-sm font-bold">
                Jadwal Wawancara:{" "}
                {new Date(upcomingInterview.datetime).toLocaleString("id-ID", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </h4>
            </div>
          </div>
          <Link href="/dashboard/interviews" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto justify-center bg-white text-emerald-900 font-bold hover:bg-emerald-50"
            >
              Lihat Detail & Konfirmasi
            </Button>
          </Link>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <GlassCard className="p-6 md:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-[#1A201C]">
                Ringkasan Data Diri
              </h2>
            </div>
            {profile?.roleInterest && (
              <Badge variant="DEFAULT">Role: {profile.roleInterest}</Badge>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-[#64746A] text-xs">
              Memuat data profil...
            </div>
          ) : isProfileComplete ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-white/40 border border-black/5">
                <span className="text-[#64746A]">Nama Lengkap</span>
                <span className="font-semibold text-sm text-[#1A201C]">
                  {profile.fullName}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-white/40 border border-black/5">
                <span className="text-[#64746A]">NIM</span>
                <span className="font-semibold text-sm text-[#1A201C]">
                  {profile.nim}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-white/40 border border-black/5">
                <span className="text-[#64746A]">Universitas</span>
                <span className="font-semibold text-sm text-[#1A201C]">
                  {profile.universitas}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-white/40 border border-black/5">
                <span className="text-[#64746A]">Program Studi</span>
                <span className="font-semibold text-sm text-[#1A201C]">
                  {profile.programStudi}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-white/40 border border-black/5">
                <span className="text-[#64746A]">IPK / Semester</span>
                <span className="font-semibold text-sm text-[#1A201C]">
                  {profile.ipk ? `${profile.ipk} (Semester ${profile.semester || "-"})` : "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-white/40 border border-black/5">
                <span className="text-[#64746A]">Berkas Terlampir</span>
                <div className="flex items-center gap-3 pt-1">
                  {profile.cvUrl && (
                    <a
                      href={profile.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#274432] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" /> Preview CV
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#274432] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Portofolio
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-600/80" />
              <p className="text-xs text-[#64746A] max-w-sm">
                Anda belum melengkapi profil pendaftaran. Segera isi informasi pribadi, akademik, dan unggah CV PDF maksimal 5MB.
              </p>
              <Link href="/dashboard/profile">
                <Button variant="primary" size="sm">
                  Isi Formulir Profil
                </Button>
              </Link>
            </div>
          )}
        </GlassCard>

        {/* Quick Action Side Panel */}
        <div className="flex flex-col gap-6">
          <GlassCard variant="tinted" className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-900">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1A201C]">
                Jalur Golden Ticket
              </h3>
            </div>
            <p className="text-xs text-[#64746A] leading-relaxed">
              Jalur khusus penugasan proyek lab bagi pendaftar dengan portofolio
              unggul. Cukup lengkapi data profil Golden Candidate.
            </p>
            <Link href="/dashboard/golden-candidate" className="pt-2">
              <Button variant="outline" size="sm" className="w-full">
                Buka Formulir
              </Button>
            </Link>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                <Rocket className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1A201C]">
                Jalur Open Recruitment
              </h3>
            </div>
            <p className="text-xs text-[#64746A] leading-relaxed">
              Daftar ke batch seleksi umum yang sedang aktif saat ini.
            </p>
            <Link href="/dashboard/oprec" className="pt-2">
              <Button variant="primary" size="sm" className="w-full">
                Cek Status Batch
              </Button>
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

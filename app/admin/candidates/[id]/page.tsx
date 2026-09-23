"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn, sanitizeExternalUrl } from "@/lib/utils";
import {
  ArrowLeft,
  GraduationCap,
  FileText,
  ExternalLink,
  Download,
  Save,
  CheckCircle2,
  FolderPlus,
  Sparkles,
  Calendar,
  X,
  Eye,
  Award,
  Quote,
  Video,
  MapPin,
  Clock,
} from "lucide-react";

export default function CandidateDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-xs text-[#64746A]">
          Memuat detail pendaftar...
        </div>
      }
    >
      <CandidateDetailContent />
    </React.Suspense>
  );
}

function CandidateDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const candidateId = params.id as string;
  const tabParam = searchParams?.get("tab")?.toUpperCase() as "OPREC" | "GOLDEN" | undefined;
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: rawData, isLoading, isError } = useQuery({
    queryKey: ["candidateDetail", candidateId],
    queryFn: async () => {
      const res = await api.getCandidateById(candidateId);
      return res.data?.data;
    },
    enabled: Boolean(candidateId),
  });

  const candidate = rawData || {};
  const profile = candidate.profile || candidate;
  
  // Registration record resolution
  const oprecRecord = candidate.oprecRecords?.[0] || candidate.registration || {};
  const registrationId = oprecRecord.id || candidate.id || candidateId;
  const currentStatus = oprecRecord.status || candidate.status || "PENDING";
  const currentAssignedProject = oprecRecord.assignedProject || candidate.assignedProject || "";

  // Golden application resolution
  const goldenApp = candidate.goldenApplication || profile?.goldenApplication || (candidate.goldenApplications ? candidate.goldenApplications[0] : null);
  const currentGoldenStatus = goldenApp?.status || "PENDING";

  const hasOprec = Boolean(
    oprecRecord.id ||
    candidate.registration ||
    (candidate.oprecRecords && candidate.oprecRecords.length > 0) ||
    candidate.status
  );

  const hasGolden = Boolean(
    profile?.isGoldenCandidate ||
    profile?.isGolden ||
    candidate?.isGoldenCandidate ||
    candidate?.isGolden ||
    goldenApp
  );

  const [activeMode, setActiveMode] = useState<"OPREC" | "GOLDEN">(
    tabParam === "GOLDEN" ? "GOLDEN" : "OPREC"
  );

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [assignedProject, setAssignedProject] = useState<string>("");
  const [selectedGoldenStatus, setSelectedGoldenStatus] = useState<string>("");
  const [isInit, setIsInit] = useState(false);
  const [isMotivationModalOpen, setIsMotivationModalOpen] = useState(false);

  // Sync mode if tab param changes or when data finishes loading
  React.useEffect(() => {
    if (tabParam === "GOLDEN") {
      setActiveMode("GOLDEN");
    } else if (tabParam === "OPREC") {
      setActiveMode("OPREC");
    } else if (rawData) {
      if (hasGolden && !hasOprec) {
        setActiveMode("GOLDEN");
      }
    }
  }, [tabParam, rawData, hasGolden, hasOprec]);

  // Interview scheduling modal state
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewDatetime, setInterviewDatetime] = useState("");
  const [interviewType, setInterviewType] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [interviewLink, setInterviewLink] = useState("https://meet.google.com/");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMotivationModalOpen(false);
    };
    if (isMotivationModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMotivationModalOpen]);

  if (rawData && !isInit) {
    setSelectedStatus(currentStatus);
    setAssignedProject(currentAssignedProject);
    setSelectedGoldenStatus(currentGoldenStatus);
    setIsInit(true);
  }

  // Mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      // 1. Update status
      await api.updateCandidateStatus(registrationId, selectedStatus);

      // 2. If status is DITERIMA and assignedProject is provided, trigger assign project
      if (selectedStatus === "DITERIMA" && assignedProject.trim()) {
        await api.assignProject(registrationId, assignedProject.trim());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateDetail", candidateId] });
      queryClient.invalidateQueries({ queryKey: ["adminCandidates"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      toast.success("Status & penugasan proyek kandidat berhasil disimpan!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal memperbarui status kandidat");
    },
  });

  // Mutation for updating Golden status
  const updateGoldenStatusMutation = useMutation({
    mutationFn: async () => {
      await api.updateGoldenStatus(candidateId, selectedGoldenStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateDetail", candidateId] });
      queryClient.invalidateQueries({ queryKey: ["adminCandidates"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      toast.success("Status evaluasi Golden Candidate berhasil diperbarui!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal memperbarui status Golden Candidate");
    },
  });

  // Mutation for scheduling interview directly from detail page
  const scheduleInterviewMutation = useMutation({
    mutationFn: async () => {
      if (!interviewDatetime) throw new Error("Waktu wawancara wajib diisi");
      return api.createInterview({
        candidateId,
        datetime: new Date(interviewDatetime).toISOString(),
        type: interviewType,
        link: interviewType === "ONLINE" ? interviewLink : undefined,
        location: interviewType === "OFFLINE" ? interviewLocation : undefined,
        notes: interviewNotes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInterviews"] });
      queryClient.invalidateQueries({ queryKey: ["candidateDetail", candidateId] });
      toast.success("Jadwal wawancara berhasil dibuat dan notifikasi dikirim!");
      setIsInterviewModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menjadwalkan wawancara");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-xs text-[#64746A]">
        Memuat detail pendaftar...
      </div>
    );
  }

  if (isError || !rawData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm text-rose-600 font-semibold">
          Data pendaftar tidak ditemukan atau terjadi kesalahan.
        </p>
        <Link href="/admin/candidates">
          <Button variant="outline" size="sm">
            Kembali ke Daftar
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center gap-3">
          <Link href="/admin/candidates">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Kembali
            </Button>
          </Link>
          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A201C] break-words">
                {profile?.fullName || candidate?.user?.email || "Detail Kandidat"}
              </h1>
              {activeMode === "GOLDEN" ? (
                <Badge variant="GOLDEN">★ Golden Ticket</Badge>
              ) : hasGolden ? (
                <Badge variant="DEFAULT" className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px]">
                  Terdaftar Golden
                </Badge>
              ) : null}
            </div>
            <span className="text-xs text-[#64746A] break-words">
              Peminatan: <strong>{profile?.roleInterest || "RISET"}</strong> • Email: {profile?.user?.email || candidate?.email || "-"}
            </span>
          </div>
        </div>

        <Badge
          variant={
            activeMode === "GOLDEN"
              ? currentGoldenStatus === "ACCEPTED"
                ? "GOLDEN"
                : currentGoldenStatus === "REJECTED"
                ? "DITOLAK"
                : "PENDING"
              : (currentStatus as BadgeVariant)
          }
          className="self-start sm:self-auto"
        >
          Tahapan ({activeMode === "GOLDEN" ? "Golden" : "Oprec"}): {activeMode === "GOLDEN" ? currentGoldenStatus : currentStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Data Detail */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Section 1: Data Akademik */}
          <GlassCard className="p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[#1A201C]">
                Informasi Akademik & Portofolio
              </h2>
            </div>

            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
              <div>
                <span className="text-[#64746A] block">NIM</span>
                <span className="font-semibold text-sm text-[#1A201C]">
                  {profile?.nim || "-"}
                </span>
              </div>
              <div>
                <span className="text-[#64746A] block">Perguruan Tinggi</span>
                <span className="font-semibold text-sm text-[#1A201C] break-words">
                  {profile?.universitas || "-"}
                </span>
              </div>
              <div>
                <span className="text-[#64746A] block">Program Studi</span>
                <span className="font-semibold text-sm text-[#1A201C] break-words">
                  {profile?.programStudi || "-"}
                </span>
              </div>
              <div>
                <span className="text-[#64746A] block">IPK Terakhir</span>
                <span className="font-semibold text-sm text-[#1A201C]">
                  {profile?.ipk || "-"}
                </span>
              </div>
              <div>
                <span className="text-[#64746A] block">Semester</span>
                <span className="font-semibold text-sm text-[#1A201C]">
                  {profile?.semester || "-"}
                </span>
              </div>
              <div>
                <span className="text-[#64746A] block">Role Interest</span>
                <span className="font-semibold text-sm text-[#1A201C]">
                  {profile?.roleInterest || "-"}
                </span>
              </div>
            </div>

            {profile?.pengalaman && (
              <div className="pt-3 border-t border-black/5 flex flex-col gap-1 text-xs">
                <span className="text-[#64746A] font-medium">
                  Pengalaman / Deskripsi Diri
                </span>
                <p className="text-[#1A201C] leading-relaxed bg-white/40 p-3 rounded-2xl border border-black/5">
                  {profile.pengalaman}
                </p>
              </div>
            )}
          </GlassCard>

          {/* Section 2: Dokumen & Tautan */}
          <GlassCard className="p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[#1A201C]">
                Berkas & Portofolio
              </h2>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              {/* CV Preview & Download */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-white/40 border border-black/5">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#274432] shrink-0" />
                  <span className="font-semibold text-[#1A201C]">
                    Curriculum Vitae (CV PDF)
                  </span>
                </div>
                {profile?.cvUrl ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={sanitizeExternalUrl(profile.cvUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        Preview File
                      </Button>
                    </a>
                    <a href={sanitizeExternalUrl(profile.cvUrl)} download target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Download className="w-3.5 h-3.5" />}
                      >
                        Unduh
                      </Button>
                    </a>
                  </div>
                ) : (
                  <span className="text-[#64746A]">Tidak ada berkas</span>
                )}
              </div>

              {/* Transkrip Preview & Download */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-white/40 border border-black/5">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#274432] shrink-0" />
                  <span className="font-semibold text-[#1A201C]">
                    Transkrip Nilai Akademik
                  </span>
                </div>
                {profile?.transkripUrl ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={sanitizeExternalUrl(profile.transkripUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        Preview File
                      </Button>
                    </a>
                  </div>
                ) : (
                  <span className="text-[#64746A]">Belum dilampirkan</span>
                )}
              </div>

              {/* Portofolio URL */}
              {profile?.portfolioUrl && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-white/40 border border-black/5">
                  <span className="font-semibold text-[#1A201C]">
                    Tautan Portofolio / Karya
                  </span>
                  <a
                    href={sanitizeExternalUrl(profile.portfolioUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#274432] font-bold flex items-center gap-1 hover:underline"
                  >
                    Buka Link <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Section 3 (Golden Candidate): Aplikasi & Portofolio Prestasi Khusus */}
          {goldenApp && (
            <GlassCard className="p-4 sm:p-6 flex flex-col gap-4 border-amber-200/60 bg-amber-500/[0.03]">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1A201C]">
                      Aplikasi & Prestasi Jalur Golden
                    </h2>
                    <span className="text-[11px] text-[#64746A]">
                      Portofolio pencapaian & esai motivasi jalur prestasi
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold border",
                    currentGoldenStatus === "ACCEPTED"
                      ? "bg-emerald-500/20 text-emerald-900 border-emerald-500/30"
                      : currentGoldenStatus === "REJECTED"
                      ? "bg-rose-500/20 text-rose-900 border-rose-500/30"
                      : "bg-amber-500/20 text-amber-900 border-amber-500/30"
                  )}
                >
                  Tahap: {currentGoldenStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                {/* Daftar Prestasi */}
                <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-white/60 border border-black/5">
                  <span className="font-bold text-[#1A201C] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    Prestasi & Pencapaian Unggulan
                  </span>
                  <p className="text-[#1A201C] leading-relaxed whitespace-pre-wrap">
                    {goldenApp.pencapaian || "Tidak ada daftar prestasi"}
                  </p>
                </div>

                {/* Surat Rekomendasi */}
                <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-white/60 border border-black/5">
                  <span className="font-bold text-[#1A201C] flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                    Kontak / Surat Rekomendasi
                  </span>
                  <p className="text-[#64746A] leading-relaxed whitespace-pre-wrap">
                    {goldenApp.rekomendasi || "Tidak dilampirkan"}
                  </p>
                </div>
              </div>

              {/* Esai Motivasi Trigger Card (Click to open popup) */}
              {goldenApp.motivasi && (
                <div
                  onClick={() => setIsMotivationModalOpen(true)}
                  className="group relative p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 to-amber-100/40 border border-amber-300/70 hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                      <Quote className="w-3.5 h-3.5 text-amber-700" />
                      <span>Esai Motivasi Riset Laboratorium</span>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-900 bg-amber-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-amber-500/40 transition-colors">
                      <Eye className="w-3 h-3" /> Klik untuk Buka Popup
                    </span>
                  </div>

                  <p className="text-xs text-[#1A201C]/80 italic line-clamp-2 leading-relaxed">
                    "{goldenApp.motivasi}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-amber-300/30 text-[11px] text-[#64746A]">
                    <span>{goldenApp.motivasi.length} karakter</span>
                    <span className="text-amber-800 font-bold group-hover:underline flex items-center gap-1">
                      Baca Esai Lengkap &rarr;
                    </span>
                  </div>
                </div>
              )}
            </GlassCard>
          )}

          {/* Section 4: Catatan Internal Admin (Dipindahkan ke kolom utama agar luas & mengisi ruang kosong) */}
          <CandidateNotesSection
            candidateId={candidateId}
            registrationId={activeMode === "OPREC" && oprecRecord.id ? oprecRecord.id : undefined}
          />
        </div>

        {/* Right Column: Admin Actions & Decisions */}
        <div className="flex flex-col gap-6">
          {/* Switcher Pill if candidate has both Oprec & Golden records */}
          {hasOprec && hasGolden && (
            <div className="p-1 rounded-2xl bg-black/[0.04] border border-black/5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveMode("OPREC")}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center",
                  activeMode === "OPREC"
                    ? "bg-white text-[#274432] shadow-xs"
                    : "text-[#64746A] hover:text-[#1A201C]"
                )}
              >
                Jalur Oprec Reguler
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("GOLDEN")}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1",
                  activeMode === "GOLDEN"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-[#64746A] hover:text-[#1A201C]"
                )}
              >
                <Sparkles className="w-3 h-3" />
                Jalur Golden Ticket
              </button>
            </div>
          )}

          {/* Regular Oprec Decision Card (Hanya muncul jika activeMode === "OPREC") */}
          {activeMode === "OPREC" && (
            <GlassCard className="p-4 sm:p-6 flex flex-col gap-5 border-white/60">
              <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-[#1A201C]">
                  Aksi Keputusan Seleksi
                </h2>
              </div>

              <Select
                label="Perbarui Status Seleksi"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={[
                  { label: "Pending (Menunggu Review)", value: "PENDING" },
                  { label: "Seleksi Berkas Lolos", value: "SELEKSI_BERKAS" },
                  { label: "Tahap Wawancara 1", value: "WAWANCARA_1" },
                  { label: "Tahap Wawancara 2", value: "WAWANCARA_2" },
                  { label: "Diterima di Lab", value: "DITERIMA" },
                  { label: "Ditolak (Tidak Lolos)", value: "DITOLAK" },
                ]}
              />

              {/* Dynamic Assigned Project Field when Status is DITERIMA */}
              {selectedStatus === "DITERIMA" && (
                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                    <FolderPlus className="w-4 h-4 text-emerald-700" />
                    <span>Penugasan Proyek (Assigned Project)</span>
                  </div>
                  <Input
                    placeholder="Contoh: Autonomous Shuttle Perception"
                    value={assignedProject}
                    onChange={(e) => setAssignedProject(e.target.value)}
                    helperText="Ketikkan nama sub-riset atau proyek yang akan dikerjakan kandidat."
                  />
                </div>
              )}

              <Button
                variant="primary"
                isLoading={updateStatusMutation.isPending}
                onClick={() => updateStatusMutation.mutate()}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Simpan Perubahan
              </Button>
            </GlassCard>
          )}

          {/* Golden Candidate Decision Card (Hanya muncul jika activeMode === "GOLDEN") */}
          {activeMode === "GOLDEN" && (
            <GlassCard className="p-4 sm:p-6 flex flex-col gap-4 border-amber-200/50 bg-amber-50/20">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A201C]">
                    Keputusan Golden Ticket
                  </h3>
                </div>
                <Badge variant={currentGoldenStatus === "ACCEPTED" ? "GOLDEN" : "PENDING"}>
                  {currentGoldenStatus}
                </Badge>
              </div>

              {goldenApp?.motivasi && (
                <button
                  type="button"
                  onClick={() => setIsMotivationModalOpen(true)}
                  className="w-full text-left p-2.5 rounded-xl bg-white/70 border border-amber-500/20 hover:border-amber-500/50 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                >
                  <span className="text-amber-950 font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    Lihat Esai Motivasi
                  </span>
                  <span className="text-amber-800 text-[11px] font-semibold flex items-center gap-1 group-hover:underline">
                    <Eye className="w-3 h-3" /> Popup
                  </span>
                </button>
              )}

              <Select
                label="Keputusan Golden Candidate"
                value={selectedGoldenStatus}
                onChange={(e) => setSelectedGoldenStatus(e.target.value)}
                options={[
                  { label: "Menunggu Review (Pending)", value: "PENDING" },
                  { label: "Tahap Seleksi Berkas (Administrative)", value: "ADMINISTRATIVE" },
                  { label: "Tahap Wawancara Khusus (Interview)", value: "INTERVIEW" },
                  { label: "Terima Golden Ticket (Accepted)", value: "ACCEPTED" },
                  { label: "Tolak (Dialihkan ke Reguler)", value: "REJECTED" },
                ]}
              />

              <Button
                variant="primary"
                className="bg-amber-600 hover:bg-amber-700 text-white border-amber-700/50"
                isLoading={updateGoldenStatusMutation.isPending}
                onClick={() => updateGoldenStatusMutation.mutate()}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Simpan Keputusan Golden
              </Button>
            </GlassCard>
          )}

          {/* Quick Interview Scheduling Card */}
          <GlassCard className="p-4 sm:p-6 flex flex-col gap-3 border-white/60">
            <h3 className="text-sm font-bold text-[#1A201C] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#274432]" />
              Sesi Wawancara
            </h3>
            <p className="text-xs text-[#64746A] leading-relaxed">
              Jadwalkan sesi tanya jawab teknis daring atau luring bersama kandidat ini.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => {
                  setInterviewDatetime(new Date().toISOString().slice(0, 16));
                  setIsInterviewModalOpen(true);
                }}
                leftIcon={<Calendar className="w-4 h-4" />}
              >
                Jadwalkan Wawancara Sekarang
              </Button>
              <Link href={`/admin/interviews?candidateId=${candidateId}`}>
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  Buka Kalender Wawancara &rarr;
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* MODAL POPUP ESAI MOTIVASI */}
      {isMotivationModalOpen && goldenApp?.motivasi && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsMotivationModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/10 flex flex-col gap-5 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-700 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1A201C]">
                    Esai Motivasi Riset Kandidat
                  </h3>
                  <span className="text-xs text-[#64746A]">
                    {profile?.fullName || candidate?.user?.email || "Kandidat"} • {profile?.programStudi || profile?.universitas || "STAS-RG"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMotivationModalOpen(false)}
                className="p-2 rounded-xl text-[#64746A] hover:text-[#1A201C] hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Tutup popup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7EC]/80 border border-[#274432]/10 text-xs sm:text-sm text-[#1A201C] leading-relaxed whitespace-pre-wrap font-sans">
                {goldenApp.motivasi}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#64746A] px-1">
                <span>
                  Panjang: {goldenApp.motivasi.length} karakter (~{goldenApp.motivasi.split(/\s+/).filter(Boolean).length} kata)
                </span>
                <span className="font-semibold text-amber-800">Jalur Golden Candidate</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsMotivationModalOpen(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP JADWAL WAWANCARA LANGSUNG */}
      {isInterviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/80 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1A201C]">
                    Jadwalkan Wawancara
                  </h3>
                  <span className="text-xs text-[#64746A]">
                    {profile?.fullName || candidate?.user?.email || "Kandidat"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsInterviewModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#64746A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <Input
                label="Tanggal & Waktu Wawancara *"
                type="datetime-local"
                value={interviewDatetime}
                onChange={(e) => setInterviewDatetime(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-[#1A201C]">
                  Jenis Wawancara
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInterviewType("ONLINE")}
                    className={cn(
                      "p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5",
                      interviewType === "ONLINE"
                        ? "bg-[#274432] text-white border-[#274432]"
                        : "bg-black/[0.02] text-[#64746A] border-black/10"
                    )}
                  >
                    <Video className="w-3.5 h-3.5" /> Daring (Online)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterviewType("OFFLINE")}
                    className={cn(
                      "p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5",
                      interviewType === "OFFLINE"
                        ? "bg-[#274432] text-white border-[#274432]"
                        : "bg-black/[0.02] text-[#64746A] border-black/10"
                    )}
                  >
                    <MapPin className="w-3.5 h-3.5" /> Luring (Tatap Muka)
                  </button>
                </div>
              </div>

              {interviewType === "ONLINE" ? (
                <Input
                  label="Tautan Google Meet / Zoom"
                  placeholder="https://meet.google.com/..."
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                />
              ) : (
                <Input
                  label="Lokasi / Ruang Wawancara"
                  placeholder="Contoh: Lab STAS-RG Lt. 3 Gedung Riset"
                  value={interviewLocation}
                  onChange={(e) => setInterviewLocation(e.target.value)}
                />
              )}

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-[#1A201C]">
                  Catatan Tambahan untuk Kandidat
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-2xl bg-black/[0.02] border border-black/10 text-xs text-[#1A201C] outline-hidden placeholder:text-[#64746A]/60"
                  placeholder="Instruksi tambahan bagi kandidat..."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-black/5">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setIsInterviewModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-full sm:w-auto"
                isLoading={scheduleInterviewMutation.isPending}
                onClick={() => scheduleInterviewMutation.mutate()}
              >
                Simpan & Kirim Jadwal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CandidateNotesSection({
  candidateId,
  registrationId,
}: {
  candidateId: string;
  registrationId?: string;
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");

  const { data: notesData, isLoading } = useQuery({
    queryKey: ["candidateNotes", candidateId],
    queryFn: async () => {
      try {
        const res = await api.getCandidateNotes(candidateId);
        const data = res.data?.data ?? res.data;
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    enabled: Boolean(candidateId),
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      if (!newNote.trim()) throw new Error("Isi catatan tidak boleh kosong");
      return api.addCandidateNote(candidateId, {
        content: newNote.trim(),
        registrationId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateNotes", candidateId] });
      setNewNote("");
      toast.success("Catatan internal berhasil ditambahkan!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menambahkan catatan");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) =>
      api.deleteCandidateNote(candidateId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateNotes", candidateId] });
      toast.success("Catatan berhasil dihapus");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menghapus catatan");
    },
  });

  const notes = notesData || [];

  return (
    <GlassCard className="p-4 sm:p-6 flex flex-col gap-4 border-white/60">
      <div className="flex items-center justify-between border-b border-black/5 pb-3">
        <h3 className="text-sm font-bold text-[#1A201C] flex items-center gap-2">
          Catatan Internal Admin
        </h3>
        <span className="text-[11px] text-[#64746A]">{notes.length} catatan</span>
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          rows={2}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Tulis catatan rahasia internal PIC (misal: penguasaan Linux baik)..."
          className="w-full px-3 py-2 rounded-2xl bg-black/[0.02] border border-black/10 focus:border-[#274432] focus:ring-1 focus:ring-[#274432] text-xs text-[#1A201C] outline-hidden placeholder:text-[#64746A]/60"
        />
        <Button
          variant="secondary"
          size="sm"
          className="self-end text-xs"
          isLoading={addNoteMutation.isPending}
          onClick={() => addNoteMutation.mutate()}
        >
          Tambah Catatan
        </Button>
      </div>

      {isLoading ? (
        <span className="text-xs text-[#64746A] text-center py-4">
          Memuat catatan...
        </span>
      ) : notes.length === 0 ? (
        <span className="text-xs text-[#64746A] text-center py-4">
          Belum ada catatan internal untuk kandidat ini.
        </span>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pt-2 divide-y divide-black/5">
          {notes.map((n: any) => (
            <div key={n.id} className="pt-2 flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1A201C]">
                  {n.user?.email || "Admin PIC"}
                </span>
                <button
                  onClick={() => deleteNoteMutation.mutate(n.id)}
                  className="text-red-500 hover:text-red-700 text-[10px] cursor-pointer"
                >
                  Hapus
                </button>
              </div>
              <p className="text-[#64746A] leading-relaxed">{n.content}</p>
              <span className="text-[10px] text-[#64746A]/70">
                {new Date(n.createdAt).toLocaleString("id-ID", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

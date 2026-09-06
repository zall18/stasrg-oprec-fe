"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

export default function CandidateDetailPage() {
  const params = useParams();
  const candidateId = params.id as string;
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

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [assignedProject, setAssignedProject] = useState<string>("");
  const [isInit, setIsInit] = useState(false);

  if (rawData && !isInit) {
    setSelectedStatus(currentStatus);
    setAssignedProject(currentAssignedProject);
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

  const isGolden = Boolean(
    profile?.isGoldenCandidate ||
    profile?.isGolden ||
    candidate?.isGoldenCandidate ||
    candidate?.isGolden
  );

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/candidates">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Kembali
            </Button>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1A201C]">
                {profile?.fullName || candidate?.user?.email || "Detail Kandidat"}
              </h1>
              {isGolden && <Badge variant="GOLDEN">★ Golden Ticket</Badge>}
            </div>
            <span className="text-xs text-[#64746A]">
              Peminatan: <strong>{profile?.roleInterest || "RISET"}</strong> • Email: {profile?.user?.email || candidate?.email || "-"}
            </span>
          </div>
        </div>

        <Badge variant={currentStatus as BadgeVariant}>
          Tahapan: {currentStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Data Detail */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Section 1: Data Akademik */}
          <GlassCard className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[#1A201C]">
                Informasi Akademik & Portofolio
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#64746A] block">NIM</span>
                <span className="font-semibold text-sm text-[#1A201C]">
                  {profile?.nim || "-"}
                </span>
              </div>
              <div>
                <span className="text-[#64746A] block">Perguruan Tinggi</span>
                <span className="font-semibold text-sm text-[#1A201C]">
                  {profile?.universitas || "-"}
                </span>
              </div>
              <div>
                <span className="text-[#64746A] block">Program Studi</span>
                <span className="font-semibold text-sm text-[#1A201C]">
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
          <GlassCard className="p-6 flex flex-col gap-4">
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
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 border border-black/5">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#274432]" />
                  <span className="font-semibold text-[#1A201C]">
                    Curriculum Vitae (CV PDF)
                  </span>
                </div>
                {profile?.cvUrl ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={profile.cvUrl}
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
                    <a href={profile.cvUrl} download target="_blank" rel="noopener noreferrer">
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
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 border border-black/5">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#274432]" />
                  <span className="font-semibold text-[#1A201C]">
                    Transkrip Nilai Akademik
                  </span>
                </div>
                {profile?.transkripUrl ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={profile.transkripUrl}
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
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 border border-black/5">
                  <span className="font-semibold text-[#1A201C]">
                    Tautan Portofolio / Karya
                  </span>
                  <a
                    href={profile.portfolioUrl}
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
        </div>

        {/* Right Column: Admin Actions */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 flex flex-col gap-5 border-white/60">
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
        </div>
      </div>
    </div>
  );
}

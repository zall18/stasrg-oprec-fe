"use client";

import React, { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  ArrowLeft,
  Calendar,
  Users,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function AdminBatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }> | { batchId: string };
}) {
  const isPromise = params && typeof (params as any).then === "function";
  const resolvedParams = isPromise
    ? use(params as Promise<{ batchId: string }>)
    : (params as { batchId: string });
  const batchId = resolvedParams.batchId;

  const { data: batchData, isLoading } = useQuery({
    queryKey: ["adminBatchDetail", batchId],
    queryFn: async () => {
      const res = await api.getBatchById(batchId);
      return res.data?.data ?? res.data;
    },
  });

  const batch = batchData;
  const statusBreakdown = batch?.statusBreakdown || {};
  const roleBreakdown = batch?.roleBreakdown || {};

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/oprec">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Kembali ke Batch
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1A201C] flex items-center gap-2">
              {batch?.name || "Detail Batch"}
              <Badge variant={batch?.isActive ? "DITERIMA" : "DEFAULT"}>
                {batch?.isActive ? "Batch Aktif" : "Non-Aktif"}
              </Badge>
            </h1>
            <p className="text-xs text-[#64746A]">
              Statistik dan analisis distribusi pendaftar pada batch ini
            </p>
          </div>
        </div>

        {batch?.name && (
          <Link href={`/admin/candidates?batch=${encodeURIComponent(batch.name)}`}>
            <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Lihat Semua Pelamar Batch Ini
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <GlassCard className="p-8 text-center text-xs text-[#64746A]">
          Memuat detail dan statistik batch...
        </GlassCard>
      ) : !batch ? (
        <GlassCard className="p-8 text-center text-xs text-[#64746A]">
          Data batch tidak ditemukan.
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <GlassCard className="p-5 flex flex-col gap-1">
              <span className="text-xs font-semibold text-[#64746A]">
                Total Pendaftar
              </span>
              <span className="text-2xl font-extrabold text-[#1A201C]">
                {batch.totalApplicants || 0}
              </span>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col gap-1">
              <span className="text-xs font-semibold text-[#64746A]">
                Target Kuota
              </span>
              <span className="text-2xl font-extrabold text-[#1A201C]">
                {batch.quota || 30}
              </span>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col gap-1">
              <span className="text-xs font-semibold text-[#64746A]">
                Jalur Golden Ticket
              </span>
              <span className="text-2xl font-extrabold text-amber-700">
                {batch.goldenCandidateCount || 0}
              </span>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col gap-1">
              <span className="text-xs font-semibold text-[#64746A]">
                Telah Diterima
              </span>
              <span className="text-2xl font-extrabold text-emerald-800">
                {statusBreakdown.DITERIMA || 0}
              </span>
            </GlassCard>
          </div>

          {/* Description Card */}
          <GlassCard className="p-6 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#1A201C]">Deskripsi Batch</h3>
            <p className="text-xs text-[#64746A] leading-relaxed">
              {batch.description || "Tidak ada deskripsi rinci untuk batch ini."}
            </p>
            <div className="flex items-center gap-4 text-xs text-[#1A201C] pt-2 border-t border-black/5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#274432]" />
                <span>
                  Periode:{" "}
                  {batch.startDate ? new Date(batch.startDate).toLocaleDateString("id-ID") : "-"} s/d{" "}
                  {batch.endDate ? new Date(batch.endDate).toLocaleDateString("id-ID") : "-"}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Distribution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <GlassCard className="p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-[#1A201C]">
                Sebaran Tahapan Status Seleksi
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries({
                  PENDING: "Pending",
                  SELEKSI_BERKAS: "Berkas",
                  WAWANCARA_1: "Wawancara 1",
                  WAWANCARA_2: "Wawancara 2",
                  DITERIMA: "Diterima",
                  DITOLAK: "Ditolak",
                }).map(([k, label]) => (
                  <div
                    key={k}
                    className="p-3 rounded-2xl bg-white/50 border border-black/5 flex flex-col items-center gap-1 text-center"
                  >
                    <span className="text-[10px] uppercase font-bold text-[#64746A]">
                      {label}
                    </span>
                    <span className="text-base font-bold text-[#1A201C]">
                      {(statusBreakdown as any)[k] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Role Breakdown */}
            <GlassCard className="p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-[#1A201C]">
                Peminatan Posisi (Role)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/50 border border-black/5 flex flex-col gap-1">
                  <span className="text-xs text-[#64746A] font-semibold">
                    Mahasiswa Riset
                  </span>
                  <span className="text-xl font-bold text-[#274432]">
                    {(roleBreakdown as any).RISET || 0} kandidat
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-white/50 border border-black/5 flex flex-col gap-1">
                  <span className="text-xs text-[#64746A] font-semibold">
                    Mahasiswa Magang
                  </span>
                  <span className="text-xl font-bold text-emerald-700">
                    {(roleBreakdown as any).MAGANG || 0} kandidat
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}

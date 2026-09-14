"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle,
  Clock,
  Settings,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Stats Query
  const {
    data: statsData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
    isFetching: isFetchingStats,
  } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await api.getDashboardStats();
      return res.data?.data;
    },
  });

  // Settings Query
  const { data: settingData } = useQuery({
    queryKey: ["oprecSettings"],
    queryFn: async () => {
      const res = await api.getRecruitmentSetting();
      return res.data?.data;
    },
  });

  const [batchName, setBatchName] = useState("");
  const [isFormInit, setIsFormInit] = useState(false);

  if (settingData && !isFormInit) {
    setBatchName(settingData.currentBatch || "Batch 1 2026");
    setIsFormInit(true);
  }

  // Toggle Setting Mutation
  const toggleMutation = useMutation({
    mutationFn: async (payload: { isActive?: boolean; isGoldenCandidateActive?: boolean }) => {
      return api.updateRecruitmentSetting({
        ...payload,
        currentBatch: batchName || settingData?.currentBatch || "Batch 1",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oprecSettings"] });
      queryClient.invalidateQueries({ queryKey: ["oprecStatus"] });
      toast.success("Pengaturan pendaftaran berhasil diperbarui!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal mengubah status pendaftaran");
    },
  });

  // Extract from both nested overview and direct format
  const totalCandidates =
    statsData?.overview?.totalCandidates ?? statsData?.totalCandidates ?? 0;
  const totalGolden =
    statsData?.overview?.totalGoldenCandidates ?? 0;
  const totalAccepted =
    statsData?.overview?.totalAccepted ?? statsData?.statusCounts?.DITERIMA ?? 0;
  const roleCounts =
    statsData?.distribution?.roleInterest ?? statsData?.roleCounts ?? {
      RISET: 0,
      MAGANG: 0,
    };
  const statusCounts =
    statsData?.distribution?.status ?? statsData?.statusCounts ?? {
      PENDING: 0,
      SELEKSI_BERKAS: 0,
      WAWANCARA_1: 0,
      WAWANCARA_2: 0,
      DITERIMA: 0,
    };

  const recentList = statsData?.recentRegistrations || [];

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A201C]">
            Statistik & Overview Seleksi
          </h1>
          <p className="text-xs text-[#64746A]">
            Pantau metrik pendaftar masuk, sebaran bidang minat, dan kelola batch aktif.
          </p>
        </div>
        <button
          onClick={() => refetchStats()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 border border-white/50 text-xs font-semibold text-[#274432] hover:bg-white/60 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetchingStats ? "animate-spin" : ""}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Top Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        <GlassCard className="p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64746A]">
              Total Pelamar Masuk
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-[#1A201C]">
            {isLoadingStats ? "..." : totalCandidates}
          </span>
          <span className="text-[11px] text-[#64746A]">
            Kandidat terdaftar di sistem
          </span>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64746A]">
              Golden Ticket
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-800">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-amber-900">
            {isLoadingStats ? "..." : totalGolden}
          </span>
          <span className="text-[11px] text-[#64746A]">
            Kandidat jalur prioritas portofolio
          </span>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64746A]">
              Peminat Riset
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-700">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-[#1A201C]">
            {isLoadingStats ? "..." : roleCounts?.RISET || 0}
          </span>
          <span className="text-[11px] text-[#64746A]">
            Magang: {roleCounts?.MAGANG || 0} pelamar
          </span>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64746A]">
              Lolos / Diterima
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-800">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-[#1A201C]">
            {isLoadingStats ? "..." : totalAccepted}
          </span>
          <span className="text-[11px] text-[#64746A]">
            Telah diterima di laboratorium
          </span>
        </GlassCard>
      </div>

      {/* Grid: Status Distribution & Batch Control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <GlassCard className="p-4 sm:p-6 lg:col-span-2 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h2 className="text-sm font-bold text-[#1A201C]">
              Sebaran Tahapan Seleksi Pelamar
            </h2>
            <Link
              href="/admin/candidates"
              className="text-xs font-semibold text-[#274432] hover:underline flex items-center gap-1"
            >
              Lihat Semua Tabel <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3">
            <div className="p-4 rounded-2xl bg-white/40 border border-black/5 flex flex-col items-center text-center gap-1.5">
              <Badge variant="PENDING">Pending</Badge>
              <span className="text-xl font-bold text-[#1A201C]">
                {statusCounts?.PENDING || 0}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/40 border border-black/5 flex flex-col items-center text-center gap-1.5">
              <Badge variant="SELEKSI_BERKAS">Berkas</Badge>
              <span className="text-xl font-bold text-[#1A201C]">
                {statusCounts?.SELEKSI_BERKAS || 0}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/40 border border-black/5 flex flex-col items-center text-center gap-1.5">
              <Badge variant="WAWANCARA_1">Wawancara 1</Badge>
              <span className="text-xl font-bold text-[#1A201C]">
                {statusCounts?.WAWANCARA_1 || 0}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/40 border border-black/5 flex flex-col items-center text-center gap-1.5">
              <Badge variant="WAWANCARA_2">Wawancara 2</Badge>
              <span className="text-xl font-bold text-[#1A201C]">
                {statusCounts?.WAWANCARA_2 || 0}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/40 border border-black/5 flex flex-col items-center text-center gap-1.5">
              <Badge variant="DITERIMA">Diterima</Badge>
              <span className="text-xl font-bold text-[#1A201C]">
                {statusCounts?.DITERIMA || 0}
              </span>
            </div>
          </div>

          {/* Visual Recharts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/40 border border-black/5 flex flex-col items-center">
              <span className="text-xs font-bold text-[#1A201C] mb-2 self-start">
                Distribusi Peminat Riset vs Magang
              </span>
              <div className="w-full h-44" data-testid="role-donut-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Riset", value: roleCounts?.RISET || 0, color: "#274432" },
                        { name: "Magang", value: roleCounts?.MAGANG || 0, color: "#10B981" },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                    >
                      <Cell fill="#274432" />
                      <Cell fill="#10B981" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 text-xs mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#274432]" />
                  <span className="text-[#64746A]">Riset ({roleCounts?.RISET || 0})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="text-[#64746A]">Magang ({roleCounts?.MAGANG || 0})</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/40 border border-black/5 flex flex-col">
              <span className="text-xs font-bold text-[#1A201C] mb-2">
                Pipeline Tahapan Seleksi
              </span>
              <div className="w-full h-44" data-testid="status-bar-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Pending", count: statusCounts?.PENDING || 0 },
                      { name: "Berkas", count: statusCounts?.SELEKSI_BERKAS || 0 },
                      { name: "Wawancara 1", count: statusCounts?.WAWANCARA_1 || 0 },
                      { name: "Wawancara 2", count: statusCounts?.WAWANCARA_2 || 0 },
                      { name: "Diterima", count: statusCounts?.DITERIMA || 0 },
                    ]}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#274432" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Registrations mini table if available */}
          {recentList.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-black/5">
              <span className="text-xs font-semibold text-[#1A201C]">
                Pendaftar Terbaru
              </span>
              <div className="flex flex-col gap-2">
                {recentList.map((rec: any) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/50 border border-black/5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1A201C]">
                        {rec.candidateName || rec.fullName}
                      </span>
                      {rec.isGoldenCandidate && (
                        <Badge variant="GOLDEN">★ Golden</Badge>
                      )}
                      <span className="text-[#64746A]">
                        • {rec.universitas || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={(rec.status || "PENDING") as BadgeVariant}>
                        {rec.status}
                      </Badge>
                      <Link href={`/admin/candidates/${rec.id}`}>
                        <Button variant="secondary" size="sm">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Batch Control Setting */}
        <GlassCard className="p-6 flex flex-col gap-5 border-white/60">
          <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
            <div className="w-8 h-8 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#1A201C]">
              Pengaturan Batch Pendaftaran
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* Active Mode Highlight Banner */}
            <div
              className={cn(
                "p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold border",
                settingData?.isActive
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950"
                  : settingData?.isGoldenCandidateActive
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-950"
                  : "bg-black/5 border-black/10 text-[#64746A]"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className={cn(
                      "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                      settingData?.isActive
                        ? "bg-emerald-400"
                        : settingData?.isGoldenCandidateActive
                        ? "bg-amber-400"
                        : "bg-gray-400"
                    )}
                  />
                  <span
                    className={cn(
                      "relative inline-flex rounded-full h-2.5 w-2.5",
                      settingData?.isActive
                        ? "bg-emerald-600"
                        : settingData?.isGoldenCandidateActive
                        ? "bg-amber-600"
                        : "bg-gray-500"
                    )}
                  />
                </span>
                <span>
                  {settingData?.isActive
                    ? "Jalur Aktif: Oprec Reguler"
                    : settingData?.isGoldenCandidateActive
                    ? "Jalur Aktif: Golden Candidate"
                    : "Semua Jalur Sedang Ditutup"}
                </span>
              </div>
              <span className="text-[10px] font-semibold opacity-75">
                {settingData?.isActive || settingData?.isGoldenCandidateActive
                  ? "Mutually Exclusive"
                  : "Standby"}
              </span>
            </div>

            <Input
              label="Nama Batch Aktif"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="Oprec Batch 1 - 2026"
            />

            <div className="flex flex-col gap-3">
              {/* Oprec Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-black/5">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#1A201C]">
                    Status Oprec Reguler
                  </span>
                  <span className="text-[11px] text-[#64746A]">
                    {settingData?.isActive
                      ? "Dibuka untuk umum"
                      : "Ditutup sementara"}
                  </span>
                </div>

                <Button
                  variant={settingData?.isActive ? "primary" : "secondary"}
                  size="sm"
                  isLoading={toggleMutation.isPending}
                  onClick={() =>
                    toggleMutation.mutate({
                      isActive: !settingData?.isActive,
                      isGoldenCandidateActive: !settingData?.isActive ? false : settingData?.isGoldenCandidateActive,
                    })
                  }
                  leftIcon={
                    settingData?.isActive ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )
                  }
                >
                  {settingData?.isActive ? "Tutup" : "Buka"}
                </Button>
              </div>

              {/* Golden Candidate Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-amber-500/20">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-amber-900">
                    Status Golden Candidate
                  </span>
                  <span className="text-[11px] text-[#64746A]">
                    {settingData?.isGoldenCandidateActive
                      ? "Jalur khusus sedang dibuka"
                      : "Ditutup sementara"}
                  </span>
                </div>

                <Button
                  variant={settingData?.isGoldenCandidateActive ? "primary" : "secondary"}
                  size="sm"
                  isLoading={toggleMutation.isPending}
                  onClick={() =>
                    toggleMutation.mutate({
                      isGoldenCandidateActive: !settingData?.isGoldenCandidateActive,
                      isActive: !settingData?.isGoldenCandidateActive ? false : settingData?.isActive,
                    })
                  }
                  leftIcon={
                    settingData?.isGoldenCandidateActive ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )
                  }
                  className={settingData?.isGoldenCandidateActive ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
                >
                  {settingData?.isGoldenCandidateActive ? "Tutup" : "Buka"}
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

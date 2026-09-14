"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  RefreshCw,
  CheckSquare,
  Square,
  CheckCircle2,
  Filter,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminCandidatesPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "GOLDEN" | "OPREC">("ALL");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("SELEKSI_BERKAS");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [previewEssay, setPreviewEssay] = useState<{
    name: string;
    motivasi: string;
    prodi?: string;
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewEssay(null);
    };
    if (previewEssay) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewEssay]);

  // Search debounce to protect backend rate limits
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const queryParams = {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    roleInterest: roleFilter || undefined,
    isGolden:
      activeTab === "GOLDEN" ? "true" : activeTab === "OPREC" ? "false" : undefined,
    page,
    limit,
  };

  const { data: rawResponse, isLoading, refetch, isFetching } = useQuery({
    queryKey: [
      "adminCandidates",
      debouncedSearch,
      activeTab,
      statusFilter,
      roleFilter,
      page,
    ],
    queryFn: async () => {
      const res = await api.getCandidates(queryParams);
      return res.data;
    },
  });

  // Bulk Status Update Mutation
  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      return api.bulkUpdateCandidateStatus(ids, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCandidates"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      toast.success(
        `Status ${selectedIds.length} kandidat berhasil diubah ke ${bulkStatus}!`
      );
      setSelectedIds([]);
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal memperbarui status secara massal");
    },
  });

  // Handle both array response and wrapped object response
  const candidates: any[] = Array.isArray(rawResponse?.data)
    ? rawResponse.data
    : rawResponse?.data?.candidates || [];

  const meta =
    rawResponse?.meta ||
    rawResponse?.data?.meta || {
      total: candidates.length,
      totalPages: Math.max(1, Math.ceil(candidates.length / limit)),
      page: 1,
    };

  const allPageIds = candidates.map((c) => c.registrationId || c.id);
  const isAllSelected =
    allPageIds.length > 0 && allPageIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allPageIds);
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A201C]">
            Manajemen Pendaftar
          </h1>
          <p className="text-xs text-[#64746A]">
            Kelola data pelamar jalur Golden Candidate dan pendaftaran Open Recruitment.
          </p>
        </div>

        {/* Tab Selection: Oprec Reguler vs Golden Candidate vs Semua */}
        <div className="flex items-center p-1 rounded-2xl sm:rounded-full bg-white/50 border border-white/60 shadow-xs backdrop-blur-md overflow-x-auto max-w-full scrollbar-none gap-1">
          <button
            onClick={() => {
              setActiveTab("OPREC");
              setPage(1);
            }}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl sm:rounded-full text-xs font-semibold transition-all cursor-pointer",
              activeTab === "OPREC"
                ? "bg-[#274432] text-white shadow-xs"
                : "text-[#64746A] hover:text-[#1A201C]"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            Oprec Reguler
          </button>
          <button
            onClick={() => {
              setActiveTab("GOLDEN");
              setPage(1);
            }}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer",
              activeTab === "GOLDEN"
                ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-400/40"
                : "text-amber-800 hover:text-amber-950 hover:bg-amber-50/60"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            Golden Candidate
          </button>
          <button
            onClick={() => {
              setActiveTab("ALL");
              setPage(1);
            }}
            className={cn(
              "shrink-0 px-3.5 sm:px-4 py-1.5 rounded-xl sm:rounded-full text-xs font-semibold transition-all cursor-pointer",
              activeTab === "ALL"
                ? "bg-[#1A201C] text-white shadow-xs"
                : "text-[#64746A] hover:text-[#1A201C]"
            )}
          >
            Semua ({meta.total || candidates.length})
          </button>
        </div>
      </div>

      {/* Info & Setting Banner for Golden Candidate */}
      {activeTab === "GOLDEN" && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-900 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-amber-950">
                Tabel Khusus: Jalur Golden Candidate
              </span>
              <span className="text-[11px] text-amber-900/80 leading-relaxed">
                Menampilkan pendaftar jalur percepatan riset dengan rekam jejak & portofolio unggul. Buka atau tutup pendaftaran Golden melalui widget sidebar atau menu pengaturan.
              </span>
            </div>
          </div>
          <Link href="/admin/dashboard" className="shrink-0">
            <Button
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto text-xs bg-white border border-amber-500/30 text-amber-900 hover:bg-amber-50 font-bold"
            >
              Pengaturan Jalur Golden →
            </Button>
          </Link>
        </div>
      )}

      {/* Filter & Search Bar */}
      <GlassCard className="p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Cari nama, NIM, email, atau universitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="flex-1 sm:flex-none px-3 py-2 rounded-2xl bg-white/60 border border-black/10 text-xs text-[#1A201C] outline-hidden"
            >
              <option value="">Semua Status</option>
              {activeTab === "GOLDEN" ? (
                <>
                  <option value="PENDING">Pending (Terkirim)</option>
                  <option value="ADMINISTRATIVE">Seleksi Berkas (Administrative)</option>
                  <option value="INTERVIEW">Wawancara Khusus</option>
                  <option value="ACCEPTED">Diterima</option>
                  <option value="REJECTED">Ditolak</option>
                </>
              ) : (
                <>
                  <option value="PENDING">Pending</option>
                  <option value="SELEKSI_BERKAS">Seleksi Berkas</option>
                  <option value="WAWANCARA_1">Wawancara 1</option>
                  <option value="WAWANCARA_2">Wawancara 2</option>
                  <option value="DITERIMA">Diterima</option>
                  <option value="DITOLAK">Ditolak</option>
                </>
              )}
            </select>

            {activeTab !== "GOLDEN" && (
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="flex-1 sm:flex-none px-3 py-2 rounded-2xl bg-white/60 border border-black/10 text-xs text-[#1A201C] outline-hidden"
              >
                <option value="">Semua Role</option>
                <option value="RISET">Riset</option>
                <option value="MAGANG">Magang</option>
              </select>
            )}

            <button
              onClick={() => refetch()}
              className="p-2 hover:bg-black/5 rounded-full text-[#274432] transition-colors cursor-pointer shrink-0"
              title="Muat ulang data"
            >
              <RefreshCw
                className={cn("w-3.5 h-3.5", isFetching && "animate-spin")}
              />
            </button>
          </div>
        </div>

        {/* Bulk Action Toolbar if items selected */}
        {selectedIds.length > 0 && (
          <div
            data-testid="bulk-action-bar"
            className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-emerald-700 text-white shadow-md animate-in fade-in duration-150"
          >
            <span className="text-xs font-bold">
              {selectedIds.length} kandidat dipilih
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs">Ubah Status ke:</span>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white text-[#1A201C] text-xs font-semibold outline-hidden"
              >
                {activeTab === "GOLDEN" ? (
                  <>
                    <option value="PENDING">Pending</option>
                    <option value="ADMINISTRATIVE">Administrative</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                  </>
                ) : (
                  <>
                    <option value="PENDING">Pending</option>
                    <option value="SELEKSI_BERKAS">Seleksi Berkas</option>
                    <option value="WAWANCARA_1">Wawancara 1</option>
                    <option value="WAWANCARA_2">Wawancara 2</option>
                    <option value="DITERIMA">Diterima</option>
                    <option value="DITOLAK">Ditolak</option>
                  </>
                )}
              </select>

              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold"
                isLoading={bulkStatusMutation.isPending}
                onClick={() =>
                  bulkStatusMutation.mutate({
                    ids: selectedIds,
                    status: bulkStatus,
                  })
                }
              >
                Terapkan Massal
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 text-xs"
                onClick={() => setSelectedIds([])}
              >
                Batal
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Candidate Data Table (Separated for Golden vs Oprec) */}
      <GlassCard className="overflow-hidden p-0 border-white/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {activeTab === "GOLDEN" ? (
                <tr className="border-b border-amber-500/20 bg-amber-500/10 text-amber-950 uppercase tracking-wider font-bold">
                  <th className="py-4 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      aria-label="Pilih Semua"
                      className="rounded-sm accent-amber-700 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-4">Kandidat Golden</th>
                  <th className="py-4 px-4">Akademik & Kampus</th>
                  <th className="py-4 px-4">Prestasi & Portofolio</th>
                  <th className="py-4 px-4">Motivasi Riset</th>
                  <th className="py-4 px-4">Tahap Seleksi Golden</th>
                  <th className="py-4 px-4 text-right">Aksi</th>
                </tr>
              ) : (
                <tr className="border-b border-black/10 bg-white/40 text-[#274432] uppercase tracking-wider font-bold">
                  <th className="py-4 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      aria-label="Pilih Semua"
                      className="rounded-sm accent-[#274432] cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-4">Kandidat</th>
                  <th className="py-4 px-4">NIM & Prodi</th>
                  <th className="py-4 px-4">Universitas</th>
                  <th className="py-4 px-4">Role Minat</th>
                  <th className="py-4 px-4">Status Seleksi</th>
                  <th className="py-4 px-4 text-right">Aksi</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64746A]">
                    Memuat data kandidat...
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64746A]">
                    {activeTab === "GOLDEN"
                      ? "Belum ada pendaftar melalui jalur Golden Candidate."
                      : "Tidak ditemukan data pendaftar yang sesuai."}
                  </td>
                </tr>
              ) : activeTab === "GOLDEN" ? (
                candidates.map((item: any) => {
                  const cand = item.candidate || item;
                  const itemKey = item.registrationId || item.id || cand.id;
                  const goldenApp = item.goldenApplication || cand.goldenApplication;
                  const name =
                    cand.fullName ||
                    item.fullName ||
                    cand.user?.email ||
                    item.email ||
                    "Kandidat";
                  const email =
                    cand.user?.email || cand.email || item.email || "-";
                  const nim = cand.nim || item.nim || "-";
                  const prodi = cand.programStudi || item.programStudi || "-";
                  const univ = cand.universitas || item.universitas || "-";
                  const status =
                    goldenApp?.status || item.status || cand.status || "PENDING";
                  const pencapaian =
                    goldenApp?.pencapaian || cand.pencapaian || "-";
                  const motivasi =
                    goldenApp?.motivasi || cand.motivasi || "-";
                  const isSelected = selectedIds.includes(itemKey);

                  return (
                    <tr
                      key={itemKey}
                      className={cn(
                        "hover:bg-amber-50/40 transition-colors",
                        isSelected && "bg-amber-50/70"
                      )}
                    >
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(itemKey)}
                          aria-label={`Pilih ${name}`}
                          className="rounded-sm accent-amber-700 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 font-bold text-[#1A201C]">
                            <span>{name}</span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-amber-500/20 text-amber-900">
                              <Sparkles className="w-2.5 h-2.5" /> Golden
                            </span>
                          </div>
                          <span className="text-[#64746A] text-[11px]">
                            {email}
                          </span>
                          {item.appliedAt && (
                            <span className="text-[10px] text-[#64746A]/80 pt-0.5">
                              Diajukan: {new Date(item.appliedAt).toLocaleDateString("id-ID")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#1A201C]">
                            {univ}
                          </span>
                          <span className="text-[#64746A] text-[11px]">
                            {prodi} • NIM {nim}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-[200px]">
                        <p className="line-clamp-2 text-[#1A201C] font-medium leading-tight" title={pencapaian}>
                          {pencapaian}
                        </p>
                      </td>
                      <td className="py-4 px-4 max-w-[220px]">
                        {motivasi && motivasi !== "-" ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewEssay({
                                name,
                                motivasi,
                                prodi: `${univ} • ${prodi}`,
                              })
                            }
                            className="text-left group cursor-pointer w-full"
                            title="Klik untuk membaca esai motivasi lengkap"
                          >
                            <p className="line-clamp-2 text-[#64746A] group-hover:text-amber-900 leading-tight">
                              {motivasi}
                            </p>
                            <span className="text-[10px] text-amber-700 font-semibold opacity-70 group-hover:opacity-100 group-hover:underline flex items-center gap-0.5 pt-0.5">
                              <Eye className="w-2.5 h-2.5" /> Buka Popup
                            </span>
                          </button>
                        ) : (
                          <span className="text-[#64746A]">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold",
                            status === "ACCEPTED"
                              ? "bg-emerald-500/20 text-emerald-900 border border-emerald-500/30"
                              : status === "REJECTED"
                              ? "bg-rose-500/20 text-rose-900 border border-rose-500/30"
                              : status === "INTERVIEW"
                              ? "bg-blue-500/20 text-blue-900 border border-blue-500/30"
                              : status === "ADMINISTRATIVE"
                              ? "bg-purple-500/20 text-purple-900 border border-purple-500/30"
                              : "bg-amber-500/20 text-amber-900 border border-amber-500/30"
                          )}
                        >
                          {status === "ACCEPTED"
                            ? "✓ Diterima"
                            : status === "REJECTED"
                            ? "✕ Ditolak"
                            : status === "INTERVIEW"
                            ? "Wawancara Khusus"
                            : status === "ADMINISTRATIVE"
                            ? "Seleksi Berkas"
                            : "Pending Review"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link href={`/admin/candidates/${cand.id || item.id}`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300/40"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                candidates.map((item: any) => {
                  const cand = item.candidate || item;
                  const itemKey = item.registrationId || item.id || cand.id;
                  const goldenApp = cand.goldenApplication || item.goldenApplication;
                  const isGolden = Boolean(
                    cand.isGoldenCandidate ||
                    cand.isGolden ||
                    item.isGoldenCandidate ||
                    item.isGolden
                  );
                  const goldenStatus = goldenApp?.status || (isGolden ? "ACCEPTED" : undefined);
                  const name =
                    cand.fullName ||
                    item.fullName ||
                    cand.user?.email ||
                    item.email ||
                    "Kandidat";
                  const email =
                    cand.user?.email || cand.email || item.email || "-";
                  const nim = cand.nim || item.nim || "-";
                  const prodi = cand.programStudi || item.programStudi || "-";
                  const univ = cand.universitas || item.universitas || "-";
                  const role =
                    cand.roleInterest || item.roleInterest || "RISET";
                  const status: BadgeVariant =
                    (item.status || cand.status || "PENDING") as BadgeVariant;
                  const isSelected = selectedIds.includes(itemKey);

                  return (
                    <tr
                      key={itemKey}
                      className={cn(
                        "hover:bg-white/40 transition-colors",
                        isSelected && "bg-emerald-50/60"
                      )}
                    >
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(itemKey)}
                          aria-label={`Pilih ${name}`}
                          className="rounded-sm accent-[#274432] cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 font-bold text-[#1A201C]">
                            <span>{name}</span>
                            {goldenStatus && goldenStatus !== "REJECTED" && (
                              <span
                                title="Golden Ticket"
                                className={cn(
                                  "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-bold",
                                  goldenStatus === "ACCEPTED"
                                    ? "bg-amber-500/20 text-amber-900"
                                    : "bg-black/5 text-[#64746A]"
                                )}
                              >
                                {goldenStatus === "ACCEPTED" ? (
                                  <>
                                    <Sparkles className="w-2.5 h-2.5" /> Golden
                                  </>
                                ) : (
                                  `[Fase ${goldenStatus}]`
                                )}
                              </span>
                            )}
                          </div>
                          <span className="text-[#64746A] text-[11px]">
                            {email}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#1A201C]">
                            {nim}
                          </span>
                          <span className="text-[#64746A] text-[11px]">
                            {prodi}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#1A201C] font-medium">
                        {univ}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold",
                            role === "RISET"
                              ? "bg-blue-500/10 text-blue-800"
                              : "bg-emerald-500/10 text-emerald-800"
                          )}
                        >
                          {role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={status}>{status}</Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link href={`/admin/candidates/${cand.id || item.id}`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Detail
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-black/5 text-xs text-[#64746A]">
            <span>
              Halaman {meta.page} dari {meta.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* MODAL POPUP PREVIEW ESAI DARI TABEL */}
      {previewEssay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPreviewEssay(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/10 flex flex-col gap-5 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
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
                    {previewEssay.name} {previewEssay.prodi ? `• ${previewEssay.prodi}` : ""}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEssay(null)}
                className="p-2 rounded-xl text-[#64746A] hover:text-[#1A201C] hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Tutup popup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7EC]/80 border border-[#274432]/10 text-xs sm:text-sm text-[#1A201C] leading-relaxed whitespace-pre-wrap font-sans">
                {previewEssay.motivasi}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#64746A] px-1">
                <span>Panjang: {previewEssay.motivasi.length} karakter</span>
                <span className="font-semibold text-amber-800">Jalur Golden Candidate</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreviewEssay(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

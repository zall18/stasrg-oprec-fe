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

        {/* Tab Selection */}
        <div className="flex items-center p-1 rounded-full bg-white/50 border border-white/60 shadow-xs backdrop-blur-md">
          <button
            onClick={() => {
              setActiveTab("ALL");
              setPage(1);
            }}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
              activeTab === "ALL"
                ? "bg-[#274432] text-white shadow-xs"
                : "text-[#64746A] hover:text-[#1A201C]"
            )}
          >
            Semua ({meta.total || candidates.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("GOLDEN");
              setPage(1);
            }}
            className={cn(
              "inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
              activeTab === "GOLDEN"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-[#64746A] hover:text-[#1A201C]"
            )}
          >
            <Sparkles className="w-3 h-3" />
            Golden Ticket
          </button>
          <button
            onClick={() => {
              setActiveTab("OPREC");
              setPage(1);
            }}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
              activeTab === "OPREC"
                ? "bg-[#274432] text-white shadow-xs"
                : "text-[#64746A] hover:text-[#1A201C]"
            )}
          >
            Oprec Reguler
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <GlassCard className="p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
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
              className="px-3 py-2 rounded-2xl bg-white/60 border border-black/10 text-xs text-[#1A201C] outline-hidden"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="SELEKSI_BERKAS">Seleksi Berkas</option>
              <option value="WAWANCARA_1">Wawancara 1</option>
              <option value="WAWANCARA_2">Wawancara 2</option>
              <option value="DITERIMA">Diterima</option>
              <option value="DITOLAK">Ditolak</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-2xl bg-white/60 border border-black/10 text-xs text-[#1A201C] outline-hidden"
            >
              <option value="">Semua Role</option>
              <option value="RISET">Riset</option>
              <option value="MAGANG">Magang</option>
            </select>

            <button
              onClick={() => refetch()}
              className="p-2 hover:bg-black/5 rounded-full text-[#274432] transition-colors cursor-pointer"
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
                <option value="PENDING">Pending</option>
                <option value="SELEKSI_BERKAS">Seleksi Berkas</option>
                <option value="WAWANCARA_1">Wawancara 1</option>
                <option value="WAWANCARA_2">Wawancara 2</option>
                <option value="DITERIMA">Diterima</option>
                <option value="DITOLAK">Ditolak</option>
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

      {/* Candidate Data Table */}
      <GlassCard className="overflow-hidden p-0 border-white/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
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
                    Tidak ditemukan data pendaftar yang sesuai.
                  </td>
                </tr>
              ) : (
                candidates.map((item: any) => {
                  const cand = item.candidate || item;
                  const itemKey = item.registrationId || item.id || cand.id;
                  const isGolden = Boolean(
                    cand.isGoldenCandidate ||
                    cand.isGolden ||
                    item.isGoldenCandidate ||
                    item.isGolden
                  );
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
                            {isGolden && (
                              <span
                                title="Golden Ticket"
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-sm bg-amber-500/20 text-amber-900 text-[10px] font-bold"
                              >
                                <Sparkles className="w-2.5 h-2.5" /> Golden
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
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Layers,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  Edit2,
  Trash2,
  ArrowRight,
  Sparkles,
  ToggleRight,
  X,
  Check,
  Search,
  FileEdit,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BatchItem {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  quota?: number;
  isActive?: boolean;
  isDraft?: boolean;
  isArchived?: boolean;
  totalApplicants?: number;
  filledQuota?: number;
  currentCandidateCount?: number;
  acceptedApplicants?: number;
}

export default function AdminBatchesPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE" | "DRAFT"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quota, setQuota] = useState(30);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDraft, setIsDraft] = useState(false);

  const { data: batchesData, isLoading } = useQuery({
    queryKey: ["adminBatches"],
    queryFn: async () => {
      try {
        const res = await api.getBatches();
        const data = res.data?.data ?? res.data;
        return Array.isArray(data) ? (data as BatchItem[]) : [];
      } catch {
        return [] as BatchItem[];
      }
    },
  });

  const openCreateModal = () => {
    setEditingBatch(null);
    setName("");
    setDescription("");
    setQuota(30);
    setStartDate("");
    setEndDate("");
    setIsDraft(false);
    setIsModalOpen(true);
  };

  const openEditModal = (batch: BatchItem) => {
    setEditingBatch(batch);
    setName(batch.name);
    setDescription(batch.description || "");
    setQuota(batch.quota || 30);
    setStartDate(batch.startDate ? batch.startDate.slice(0, 10) : "");
    setEndDate(batch.endDate ? batch.endDate.slice(0, 10) : "");
    setIsDraft(Boolean(batch.isDraft));
    setIsModalOpen(true);
  };

  // Helper to convert date input string to ISO 8601 string expected by backend Zod validator
  const formatToISO = (dateStr: string, isEndOfDay = false): string | null => {
    if (!dateStr || !dateStr.trim()) return null;
    const trimmed = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return isEndOfDay
        ? new Date(`${trimmed}T23:59:59.999Z`).toISOString()
        : new Date(`${trimmed}T00:00:00.000Z`).toISOString();
    }
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed.toISOString();
  };

  // Create or Update Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Nama batch wajib diisi");

      const startISO = formatToISO(startDate, false);
      const endISO = formatToISO(endDate, true);

      if (startISO && endISO && new Date(endISO) < new Date(startISO)) {
        throw new Error(
          "Tanggal selesai tidak boleh lebih awal dari tanggal mulai"
        );
      }

      const parsedQuota = Number(quota);
      if (isNaN(parsedQuota) || parsedQuota <= 0) {
        throw new Error("Kuota harus berupa angka positif minimal 1");
      }

      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        quota: parsedQuota,
        startDate: startISO,
        endDate: endISO,
        isDraft,
      };

      if (editingBatch) {
        return api.updateBatch(editingBatch.id, payload);
      } else {
        return api.createBatch(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBatches"] });
      queryClient.invalidateQueries({ queryKey: ["oprecSettings"] });
      queryClient.invalidateQueries({ queryKey: ["oprecStatus"] });
      toast.success(
        editingBatch
          ? "Batch berhasil diperbarui!"
          : isDraft
          ? "Draft batch berhasil disimpan!"
          : "Batch baru berhasil dibuat!"
      );
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menyimpan batch");
    },
  });

  // Activate Mutation
  const activateMutation = useMutation({
    mutationFn: (id: string) => api.activateBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBatches"] });
      queryClient.invalidateQueries({ queryKey: ["oprecSettings"] });
      queryClient.invalidateQueries({ queryKey: ["oprecStatus"] });
      toast.success("Batch berhasil diaktifkan sebagai batch utama!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal mengaktifkan batch");
    },
  });

  // Delete / Archive Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBatches"] });
      toast.success("Batch berhasil dihapus / diarsipkan!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menghapus batch");
    },
  });

  const batches = batchesData || [];

  // Filter calculations
  const countActive = batches.filter((b) => b.isActive).length;
  const countDraft = batches.filter((b) => b.isDraft).length;
  const countInactive = batches.filter((b) => !b.isActive && !b.isDraft).length;

  const filteredBatches = batches.filter((b) => {
    if (
      searchQuery &&
      !b.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !b.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (statusFilter === "ACTIVE") return Boolean(b.isActive);
    if (statusFilter === "DRAFT") return Boolean(b.isDraft);
    if (statusFilter === "INACTIVE") return !b.isActive && !b.isDraft;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A201C] flex items-center gap-2">
            Manajemen Batch Oprec
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-[#274432]" />
          </h1>
          <p className="text-xs text-[#64746A]">
            Atur periode rekrutmen, kuota penerimaan, status aktif/nonaktif, dan buat draft batch
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto shadow-md"
        >
          Buat Batch Baru
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <GlassCard className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-white/60">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer",
              statusFilter === "ALL"
                ? "bg-[#274432] text-white shadow-xs"
                : "bg-white/60 text-[#64746A] hover:bg-white hover:text-[#1A201C] border border-black/5"
            )}
          >
            Semua ({batches.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("ACTIVE")}
            className={cn(
              "px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              statusFilter === "ACTIVE"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-white/60 text-emerald-800 hover:bg-emerald-50 border border-emerald-500/20"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Aktif ({countActive})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("INACTIVE")}
            className={cn(
              "px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer",
              statusFilter === "INACTIVE"
                ? "bg-gray-700 text-white shadow-xs"
                : "bg-white/60 text-[#64746A] hover:bg-white border border-black/5"
            )}
          >
            Tidak Aktif ({countInactive})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("DRAFT")}
            className={cn(
              "px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              statusFilter === "DRAFT"
                ? "bg-purple-700 text-white shadow-xs"
                : "bg-white/60 text-purple-800 hover:bg-purple-50 border border-purple-500/20"
            )}
          >
            <FileEdit className="w-3 h-3 text-purple-600" />
            Draft ({countDraft})
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-64">
          <Input
            placeholder="Cari nama batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </GlassCard>

      {/* Batches Grid */}
      {isLoading ? (
        <GlassCard className="p-8 text-center text-xs text-[#64746A]">
          Memuat daftar batch...
        </GlassCard>
      ) : filteredBatches.length === 0 ? (
        <GlassCard className="p-8 sm:p-12 text-center flex flex-col items-center gap-3 border-white/60">
          <Layers className="w-12 h-12 text-[#64746A]/40" />
          <h3 className="text-base font-bold text-[#1A201C]">
            Tidak Ada Batch yang Sesuai
          </h3>
          <p className="text-xs text-[#64746A] max-w-sm">
            {batches.length === 0
              ? 'Klik tombol "Buat Batch Baru" di atas untuk menambahkan batch pendaftaran pertama.'
              : "Tidak ditemukan batch pada filter yang dipilih. Coba ganti filter status atau kata kunci."}
          </p>
          {batches.length === 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={openCreateModal}
              className="w-full sm:w-auto"
            >
              Buat Batch Sekarang
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredBatches.map((b) => {
            const filled =
              b.filledQuota ??
              b.currentCandidateCount ??
              b.acceptedApplicants ??
              0;
            const quota = b.quota || 30;
            const pct = Math.min(100, Math.round((filled / quota) * 100));

            return (
              <GlassCard
                key={b.id}
                className={cn(
                  "p-4 sm:p-6 flex flex-col justify-between gap-4 sm:gap-5 transition-all",
                  b.isActive
                    ? "border-2 border-emerald-600 bg-emerald-500/[0.04] ring-2 ring-emerald-500/20 shadow-md"
                    : b.isDraft
                    ? "border-2 border-purple-400 bg-purple-50/20"
                    : "border-black/10 bg-white/40 opacity-90 hover:opacity-100 hover:shadow-md"
                )}
              >
                <div className="flex flex-col gap-3.5">
                  {/* Status Banner / Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-base font-extrabold text-[#1A201C] line-clamp-1">
                        {b.name}
                      </h3>
                      <span className="text-[10px] text-[#64746A]">
                        ID: {b.id.slice(0, 8)}...
                      </span>
                    </div>

                    {b.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white shadow-xs tracking-wide shrink-0">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        BATCH AKTIF
                      </span>
                    ) : b.isDraft ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300 shrink-0">
                        <FileEdit className="w-3 h-3 text-purple-700" />
                        DRAFT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/5 text-[#64746A] shrink-0">
                        Tidak Aktif
                      </span>
                    )}
                  </div>

                  {b.isActive && (
                    <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Sedang menerima pendaftaran kandidat</span>
                    </div>
                  )}

                  {b.isDraft && (
                    <div className="text-[11px] text-purple-900 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <span>Draf belum dipublikasikan ke publik</span>
                    </div>
                  )}

                  <p className="text-xs text-[#64746A] line-clamp-2 leading-relaxed">
                    {b.description || "Tidak ada deskripsi batch."}
                  </p>

                  {/* Capacity Progress Section */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white/60 border border-black/5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64746A] font-semibold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#274432]" />
                        Kapasitas Terpenuhi
                      </span>
                      <span className="font-extrabold text-[#1A201C]">
                        <span
                          className={cn(
                            pct >= 100
                              ? "text-rose-600 font-bold"
                              : "text-emerald-700 font-bold"
                          )}
                        >
                          {filled}
                        </span>{" "}
                        / {quota} orang ({pct}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          pct >= 100
                            ? "bg-rose-500"
                            : pct >= 80
                            ? "bg-amber-500"
                            : "bg-emerald-600"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#64746A] pt-0.5">
                      <span>
                        Total Pelamar:{" "}
                        <strong>{b.totalApplicants || 0} orang</strong>
                      </span>
                      <span>
                        Sisa Kuota:{" "}
                        <strong>{Math.max(0, quota - filled)} kursi</strong>
                      </span>
                    </div>
                  </div>

                  {(b.startDate || b.endDate) && (
                    <div className="text-[11px] text-[#64746A] flex items-center gap-1.5 pt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-[#274432]" />
                      <span>
                        {b.startDate
                          ? new Date(b.startDate).toLocaleDateString("id-ID")
                          : "-"}{" "}
                        s/d{" "}
                        {b.endDate
                          ? new Date(b.endDate).toLocaleDateString("id-ID")
                          : "-"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-black/5 gap-2">
                  <div className="flex items-center gap-1.5">
                    {!b.isActive ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs font-bold bg-[#274432] text-white hover:bg-[#1e3426] h-8 px-3"
                        isLoading={activateMutation.isPending}
                        onClick={() => activateMutation.mutate(b.id)}
                        leftIcon={<ToggleRight className="w-3.5 h-3.5" />}
                      >
                        Aktifkan
                      </Button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                        ✓ Utama
                      </span>
                    )}

                    <Link href={`/admin/oprec/${b.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs h-8">
                        Detail →
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1.5"
                      onClick={() => openEditModal(b)}
                      aria-label="Edit Batch"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#64746A]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (
                          confirm(
                            `Yakin ingin menghapus / mengarsipkan batch "${b.name}"?`
                          )
                        ) {
                          deleteMutation.mutate(b.id);
                        }
                      }}
                      aria-label="Hapus Batch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/80 flex flex-col gap-4 sm:gap-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <h3 className="text-base font-bold text-[#1A201C]">
                {editingBatch ? "Edit Batch Oprec" : "Buat Batch Oprec Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#64746A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <Input
                label="Nama Batch *"
                placeholder="Contoh: Batch 2 - 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1A201C]">
                  Deskripsi Batch
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/[0.02] border border-black/10 focus:border-[#274432] focus:ring-1 focus:ring-[#274432] text-xs text-[#1A201C] outline-hidden placeholder:text-[#64746A]/60"
                  placeholder="Deskripsi singkat topik riset atau ketentuan batch..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Target Kuota"
                  type="number"
                  placeholder="30"
                  value={quota}
                  onChange={(e) => setQuota(Number(e.target.value))}
                />
                <Input
                  label="Tgl Mulai"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  label="Tgl Selesai"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Draft Checkbox Toggle */}
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDraft}
                  onChange={(e) => setIsDraft(e.target.checked)}
                  className="w-4 h-4 rounded-sm accent-purple-700 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1A201C]">
                    Simpan Sebagai Draft
                  </span>
                  <span className="text-[11px] text-[#64746A]">
                    Batch draft belum dipublikasikan ke kandidat pendaftar
                  </span>
                </div>
              </label>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-black/5">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-full sm:w-auto"
                isLoading={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {editingBatch
                  ? "Simpan Perubahan"
                  : isDraft
                  ? "Simpan sebagai Draft"
                  : "Buat Batch"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

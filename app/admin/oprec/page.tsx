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
} from "lucide-react";

interface BatchItem {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  quota?: number;
  isActive?: boolean;
  isArchived?: boolean;
  totalApplicants?: number;
}

export default function AdminBatchesPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quota, setQuota] = useState(30);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
    setIsModalOpen(true);
  };

  const openEditModal = (batch: BatchItem) => {
    setEditingBatch(batch);
    setName(batch.name);
    setDescription(batch.description || "");
    setQuota(batch.quota || 30);
    setStartDate(batch.startDate ? batch.startDate.slice(0, 10) : "");
    setEndDate(batch.endDate ? batch.endDate.slice(0, 10) : "");
    setIsModalOpen(true);
  };

  // Create or Update Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Nama batch wajib diisi");
      const payload = {
        name,
        description: description || undefined,
        quota: Number(quota) || 30,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
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

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A201C] flex items-center gap-2">
            Manajemen Batch Oprec
            <Layers className="w-6 h-6 text-[#274432]" />
          </h1>
          <p className="text-xs text-[#64746A]">
            Atur periode rekrutmen, kuota penerimaan, dan aktivasi batch pendaftaran
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Buat Batch Baru
        </Button>
      </div>

      {/* Batches Grid */}
      {isLoading ? (
        <GlassCard className="p-8 text-center text-xs text-[#64746A]">
          Memuat daftar batch...
        </GlassCard>
      ) : batches.length === 0 ? (
        <GlassCard className="p-12 text-center flex flex-col items-center gap-3">
          <Layers className="w-12 h-12 text-[#64746A]/40" />
          <h3 className="text-base font-bold text-[#1A201C]">Belum Ada Batch</h3>
          <p className="text-xs text-[#64746A] max-w-sm">
            Klik tombol "Buat Batch Baru" di atas untuk menambahkan batch pendaftaran pertama.
          </p>
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            Buat Batch Sekarang
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((b) => (
            <GlassCard
              key={b.id}
              className="p-6 flex flex-col justify-between gap-5 border-white/60 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-[#1A201C] line-clamp-1">
                    {b.name}
                  </h3>
                  <Badge variant={b.isActive ? "DITERIMA" : "DEFAULT"}>
                    {b.isActive ? "Aktif" : "Non-Aktif"}
                  </Badge>
                </div>

                <p className="text-xs text-[#64746A] line-clamp-2 leading-relaxed">
                  {b.description || "Tidak ada deskripsi batch."}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-black/5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[#64746A] text-[10px] uppercase font-bold">
                      Total Pelamar
                    </span>
                    <span className="font-bold text-[#1A201C] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#274432]" />
                      {b.totalApplicants || 0} orang
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[#64746A] text-[10px] uppercase font-bold">
                      Target Kuota
                    </span>
                    <span className="font-bold text-[#1A201C]">
                      {b.quota || 30} kandidat
                    </span>
                  </div>
                </div>

                {(b.startDate || b.endDate) && (
                  <div className="text-[11px] text-[#64746A] flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-[#274432]" />
                    <span>
                      {b.startDate ? new Date(b.startDate).toLocaleDateString("id-ID") : "-"} s/d{" "}
                      {b.endDate ? new Date(b.endDate).toLocaleDateString("id-ID") : "-"}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-black/5 gap-2">
                <div className="flex items-center gap-1">
                  {!b.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-emerald-800"
                      onClick={() => activateMutation.mutate(b.id)}
                      isLoading={activateMutation.isPending}
                    >
                      Aktifkan
                    </Button>
                  )}
                  <Link href={`/admin/oprec/${b.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Detail
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
                      if (confirm(`Yakin ingin menghapus / mengarsipkan batch "${b.name}"?`)) {
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
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-white/80 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
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
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {editingBatch ? "Simpan Perubahan" : "Buat Batch"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

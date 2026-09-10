"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Megaphone,
  Plus,
  Clock,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Sparkles,
} from "lucide-react";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Query announcements
  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ["adminAnnouncements"],
    queryFn: async () => {
      try {
        const res = await api.getAnnouncements();
        const data = res.data?.data ?? res.data;
        return Array.isArray(data) ? (data as AnnouncementItem[]) : [];
      } catch {
        return [] as AnnouncementItem[];
      }
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle("");
    setContent("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AnnouncementItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setContent(item.content);
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  // Create / Update mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Judul pengumuman wajib diisi");
      if (!content.trim()) throw new Error("Isi pengumuman wajib diisi");

      const payload = {
        title: title.trim(),
        content: content.trim(),
        isActive,
      };

      if (editingItem) {
        return api.updateAnnouncement(editingItem.id, payload);
      } else {
        return api.createAnnouncement(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAnnouncements"] });
      toast.success(
        editingItem
          ? "Pengumuman berhasil diperbarui!"
          : "Pengumuman baru berhasil diterbitkan!"
      );
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menyimpan pengumuman");
    },
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, currentActive }: { id: string; currentActive: boolean }) =>
      api.updateAnnouncement(id, { isActive: !currentActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAnnouncements"] });
      toast.success("Status tayang pengumuman berhasil diubah!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal mengubah status pengumuman");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAnnouncements"] });
      toast.success("Pengumuman berhasil dihapus!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menghapus pengumuman");
    },
  });

  const list = announcementsData || [];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A201C] flex items-center gap-2">
            Manajemen Pengumuman
            <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-[#274432]" />
          </h1>
          <p className="text-xs text-[#64746A]">
            Terbitkan informasi resmi, pengumuman hasil seleksi, dan arahan pendaftaran
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Buat Pengumuman
        </Button>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <GlassCard className="p-8 text-center text-xs text-[#64746A]">
          Memuat pengumuman...
        </GlassCard>
      ) : list.length === 0 ? (
        <GlassCard className="p-8 sm:p-12 text-center flex flex-col items-center gap-3">
          <Megaphone className="w-12 h-12 text-[#64746A]/40" />
          <h3 className="text-base font-bold text-[#1A201C]">
            Belum Ada Pengumuman
          </h3>
          <p className="text-xs text-[#64746A] max-w-sm">
            Klik tombol di atas untuk menerbitkan pengumuman publik pertama bagi calon pendaftar.
          </p>
          <Button variant="primary" size="sm" onClick={openCreateModal} className="w-full sm:w-auto">
            Buat Pengumuman Sekarang
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {list.map((item) => (
            <GlassCard
              key={item.id}
              className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-white/60 hover:shadow-md transition-all"
            >
              <div className="flex flex-col gap-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-base font-bold text-[#1A201C] break-words">
                    {item.title}
                  </h3>
                  <Badge variant={item.isActive ? "DITERIMA" : "DEFAULT"}>
                    {item.isActive ? "Tayang" : "Draft / Non-Aktif"}
                  </Badge>
                </div>
                <p className="text-xs text-[#64746A] leading-relaxed break-words">
                  {item.content}
                </p>
                <span className="text-[11px] text-[#64746A]/70 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  Diterbitkan:{" "}
                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-black/5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toggleMutation.mutate({
                      id: item.id,
                      currentActive: item.isActive,
                    })
                  }
                  leftIcon={
                    item.isActive ? (
                      <ToggleRight className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-[#64746A]" />
                    )
                  }
                >
                  {item.isActive ? "Nonaktifkan" : "Aktifkan"}
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => openEditModal(item)}
                    aria-label="Edit Pengumuman"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#64746A]" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm(`Hapus pengumuman "${item.title}"?`)) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                    aria-label="Hapus Pengumuman"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/80 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <h3 className="text-base font-bold text-[#1A201C]">
                {editingItem ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#64746A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <Input
                label="Judul Pengumuman *"
                placeholder="Contoh: Pengumuman Kelulusan Berkas Tahap 1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1A201C]">
                  Isi Pengumuman *
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/[0.02] border border-black/10 text-xs text-[#1A201C] outline-hidden placeholder:text-[#64746A]/60"
                  placeholder="Isi rincian pengumuman yang akan dibaca pendaftar..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/[0.02] border border-black/5">
                <span className="text-xs font-semibold text-[#1A201C]">
                  Status Penayangan Publik
                </span>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded-sm accent-[#274432] cursor-pointer"
                />
              </div>
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
                {editingItem ? "Simpan Perubahan" : "Terbitkan Pengumuman"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
import { Select } from "@/components/ui/select";
import {
  CalendarCheck,
  Plus,
  Video,
  MapPin,
  Clock,
  User,
  X,
  Edit2,
  Trash2,
  Calendar,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminInterview {
  id: string;
  candidateId: string;
  datetime: string;
  type: "ONLINE" | "OFFLINE";
  link?: string;
  location?: string;
  notes?: string;
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  candidate?: {
    id: string;
    fullName?: string;
    universitas?: string;
    user?: { email: string };
  };
}

export default function AdminInterviewsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<AdminInterview | null>(
    null
  );

  // Form states
  const [candidateId, setCandidateId] = useState("");
  const [datetime, setDatetime] = useState("");
  const [type, setType] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [link, setLink] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Query interviews
  const { data: interviewsData, isLoading } = useQuery({
    queryKey: ["adminInterviews", statusFilter],
    queryFn: async () => {
      try {
        const res = await api.getAdminInterviews({
          status: statusFilter || undefined,
        });
        const data = res.data?.data ?? res.data;
        return Array.isArray(data) ? (data as AdminInterview[]) : [];
      } catch {
        return [] as AdminInterview[];
      }
    },
  });

  // Query candidates for select dropdown
  const { data: candidatesData } = useQuery({
    queryKey: ["adminCandidateOptions"],
    queryFn: async () => {
      try {
        const res = await api.getCandidates({ limit: 100 });
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : res.data?.data?.candidates || [];
        return list;
      } catch {
        return [];
      }
    },
  });

  const openCreateModal = () => {
    setEditingInterview(null);
    setCandidateId(candidatesData?.[0]?.id || "");
    setDatetime(new Date().toISOString().slice(0, 16));
    setType("ONLINE");
    setLink("https://meet.google.com/");
    setLocation("");
    setNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (iv: AdminInterview) => {
    setEditingInterview(iv);
    setCandidateId(iv.candidateId);
    setDatetime(
      iv.datetime ? new Date(iv.datetime).toISOString().slice(0, 16) : ""
    );
    setType(iv.type || "ONLINE");
    setLink(iv.link || "");
    setLocation(iv.location || "");
    setNotes(iv.notes || "");
    setIsModalOpen(true);
  };

  // Create or update interview mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!datetime) throw new Error("Waktu wawancara wajib diisi");
      if (!editingInterview && !candidateId) {
        throw new Error("Kandidat wajib dipilih");
      }

      const payload = {
        candidateId,
        datetime: new Date(datetime).toISOString(),
        type,
        link: type === "ONLINE" ? link : undefined,
        location: type === "OFFLINE" ? location : undefined,
        notes: notes || undefined,
      };

      if (editingInterview) {
        return api.updateInterview(editingInterview.id, payload);
      } else {
        return api.createInterview(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInterviews"] });
      toast.success(
        editingInterview
          ? "Jadwal wawancara berhasil diperbarui!"
          : "Wawancara berhasil dijadwalkan dan notifikasi telah dikirim!"
      );
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menyimpan jadwal wawancara");
    },
  });

  // Cancel interview mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.cancelInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInterviews"] });
      toast.success("Jadwal wawancara berhasil dibatalkan");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal membatalkan jadwal");
    },
  });

  const interviews = interviewsData || [];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A201C] flex items-center gap-2">
            Penjadwalan Wawancara
            <CalendarCheck className="w-6 h-6 text-[#274432]" />
          </h1>
          <p className="text-xs text-[#64746A]">
            Atur dan kelola sesi wawancara daring atau luring bersama kandidat seleksi
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Buat Jadwal Wawancara
        </Button>
      </div>

      {/* Filter Bar */}
      <GlassCard className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#64746A]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/60 border border-black/10 text-xs text-[#1A201C] outline-hidden"
          >
            <option value="">Semua Status Wawancara</option>
            <option value="SCHEDULED">Menunggu Konfirmasi (Scheduled)</option>
            <option value="CONFIRMED">Terkonfirmasi (Confirmed)</option>
            <option value="COMPLETED">Selesai (Completed)</option>
            <option value="CANCELLED">Dibatalkan (Cancelled)</option>
          </select>
        </div>

        <span className="text-xs text-[#64746A]">
          Total {interviews.length} sesi
        </span>
      </GlassCard>

      {/* Interviews Table / Cards */}
      {isLoading ? (
        <GlassCard className="p-8 text-center text-xs text-[#64746A]">
          Memuat jadwal wawancara...
        </GlassCard>
      ) : interviews.length === 0 ? (
        <GlassCard className="p-12 text-center flex flex-col items-center gap-3">
          <Calendar className="w-12 h-12 text-[#64746A]/40" />
          <h3 className="text-base font-bold text-[#1A201C]">
            Belum Ada Sesi Wawancara
          </h3>
          <p className="text-xs text-[#64746A] max-w-sm">
            Klik tombol di atas untuk menjadwalkan wawancara pertama untuk kandidat.
          </p>
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            Jadwalkan Wawancara Sekarang
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((item) => {
            const isOnline = item.type === "ONLINE";
            const dateObj = new Date(item.datetime);
            const candName =
              item.candidate?.fullName ||
              item.candidate?.user?.email ||
              `Kandidat #${item.candidateId?.slice(0, 8)}`;

            return (
              <GlassCard
                key={item.id}
                className="p-6 flex flex-col justify-between gap-4 border-white/60 hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1A201C]">
                          {candName}
                        </h4>
                        <span className="text-[11px] text-[#64746A]">
                          {item.candidate?.universitas || "-"}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        item.status === "CONFIRMED"
                          ? "DITERIMA"
                          : item.status === "COMPLETED"
                          ? "DEFAULT"
                          : item.status === "CANCELLED"
                          ? "DITOLAK"
                          : "PENDING"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#1A201C] pt-2 border-t border-black/5">
                    <Clock className="w-3.5 h-3.5 text-[#274432]" />
                    <span>
                      {dateObj.toLocaleString("id-ID", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#1A201C]">
                    {isOnline ? (
                      <Video className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                    <span className="truncate">
                      {isOnline
                        ? item.link || "Tautan Google Meet"
                        : item.location || "Lokasi Lab STAS-RG"}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-[#64746A] italic bg-white/40 p-2.5 rounded-xl border border-black/5">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-black/5">
                  <Link href={`/admin/candidates/${item.candidateId}`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Profil Kandidat
                    </Button>
                  </Link>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1.5"
                      onClick={() => openEditModal(item)}
                      aria-label="Edit Jadwal"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#64746A]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1.5 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("Batalkan sesi wawancara ini?")) {
                          cancelMutation.mutate(item.id);
                        }
                      }}
                      aria-label="Batalkan Jadwal"
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

      {/* Schedule Interview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white/80 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <h3 className="text-base font-bold text-[#1A201C]">
                {editingInterview ? "Perbarui Jadwal" : "Buat Jadwal Wawancara"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#64746A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {!editingInterview && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1A201C]">
                    Pilih Kandidat *
                  </label>
                  <select
                    value={candidateId}
                    onChange={(e) => setCandidateId(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl bg-black/[0.02] border border-black/10 text-xs text-[#1A201C] outline-hidden"
                  >
                    {candidatesData && candidatesData.length > 0 ? (
                      candidatesData.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName || c.email} ({c.universitas || "-"})
                        </option>
                      ))
                    ) : (
                      <option value="">Tidak ada kandidat</option>
                    )}
                  </select>
                </div>
              )}

              <Input
                label="Tanggal & Waktu Wawancara *"
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1A201C]">
                  Jenis Wawancara
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("ONLINE")}
                    className={cn(
                      "p-2.5 rounded-xl text-xs font-bold border transition-all",
                      type === "ONLINE"
                        ? "bg-[#274432] text-white border-[#274432]"
                        : "bg-black/[0.02] text-[#64746A] border-black/10"
                    )}
                  >
                    Daring (Online)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("OFFLINE")}
                    className={cn(
                      "p-2.5 rounded-xl text-xs font-bold border transition-all",
                      type === "OFFLINE"
                        ? "bg-[#274432] text-white border-[#274432]"
                        : "bg-black/[0.02] text-[#64746A] border-black/10"
                    )}
                  >
                    Luring (Tatap Muka)
                  </button>
                </div>
              </div>

              {type === "ONLINE" ? (
                <Input
                  label="Tautan Google Meet / Zoom"
                  placeholder="https://meet.google.com/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              ) : (
                <Input
                  label="Lokasi / Ruang Wawancara"
                  placeholder="Contoh: Lab STAS-RG Lt. 3 Gedung Riset"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1A201C]">
                  Catatan Wawancara
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-2xl bg-black/[0.02] border border-black/10 text-xs text-[#1A201C] outline-hidden placeholder:text-[#64746A]/60"
                  placeholder="Instruksi tambahan untuk kandidat..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                Simpan Jadwal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

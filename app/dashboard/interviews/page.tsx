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
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  CalendarCheck,
  UserCheck,
  RefreshCw,
  X,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Interview {
  id: string;
  candidateId: string;
  datetime: string;
  type: "ONLINE" | "OFFLINE";
  link?: string;
  location?: string;
  notes?: string;
  status:
    | "SCHEDULED"
    | "CONFIRMED"
    | "RESCHEDULE_REQUESTED"
    | "RESCHEDULE_REJECTED"
    | "COMPLETED"
    | "CANCELLED";
  picName?: string;
  picId?: string;
  pic?: {
    id: string;
    email: string;
    fullName?: string;
  };
  rescheduleProposedDate?: string;
  rescheduleReason?: string;
  adminRescheduleNote?: string;
}

export default function CandidateInterviewsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [rescheduleModalInterview, setRescheduleModalInterview] =
    useState<Interview | null>(null);
  const [proposedDatetime, setProposedDatetime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  const { data: interviewsData, isLoading, refetch } = useQuery({
    queryKey: ["candidateInterviewsPage"],
    queryFn: async () => {
      try {
        const res = await api.getCandidateInterviews();
        const data = res.data?.data ?? res.data;
        return Array.isArray(data) ? (data as Interview[]) : [];
      } catch {
        return [] as Interview[];
      }
    },
  });

  // Confirm attendance mutation
  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.confirmInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateInterviewsPage"] });
      queryClient.invalidateQueries({ queryKey: ["candidateInterviews"] });
      toast.success("Kehadiran wawancara berhasil dikonfirmasi!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal mengonfirmasi kehadiran");
    },
  });

  // Reschedule mutation
  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      if (!rescheduleModalInterview) return;
      if (!proposedDatetime) {
        throw new Error("Pilih tanggal dan jam usulan baru.");
      }
      if (!rescheduleReason.trim() || rescheduleReason.trim().length < 5) {
        throw new Error("Berikan alasan reschedule minimal 5 karakter.");
      }

      const isoDate = new Date(proposedDatetime).toISOString();

      return api.rescheduleInterview(rescheduleModalInterview.id, {
        proposedDatetime: isoDate,
        reason: rescheduleReason.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateInterviewsPage"] });
      queryClient.invalidateQueries({ queryKey: ["candidateInterviews"] });
      toast.success(
        "Permohonan reschedule berhasil dikirimkan ke panitia/admin!"
      );
      setRescheduleModalInterview(null);
      setProposedDatetime("");
      setRescheduleReason("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal mengajukan reschedule");
    },
  });

  const openRescheduleModal = (item: Interview) => {
    setRescheduleModalInterview(item);
    // Default proposed to tomorrow same time if empty
    const current = new Date(item.datetime);
    current.setDate(current.getDate() + 1);
    const localIso = new Date(
      current.getTime() - current.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);
    setProposedDatetime(localIso);
    setRescheduleReason("");
  };

  const interviews = interviewsData || [];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Kembali
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1A201C] flex items-center gap-2">
              Jadwal Wawancara
              <CalendarCheck className="w-6 h-6 text-[#274432]" />
            </h1>
            <p className="text-xs text-[#64746A]">
              Daftar sesi wawancara seleksi laboratorium STAS-RG yang dijadwalkan untuk Anda
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <GlassCard className="p-8 text-center text-xs text-[#64746A]">
          Memuat jadwal wawancara...
        </GlassCard>
      ) : interviews.length === 0 ? (
        <GlassCard className="p-12 text-center flex flex-col items-center gap-3 border-white/60">
          <Calendar className="w-12 h-12 text-[#64746A]/40" />
          <h3 className="text-base font-bold text-[#1A201C]">
            Belum Ada Jadwal Wawancara
          </h3>
          <p className="text-xs text-[#64746A] max-w-md leading-relaxed">
            Jika berkas dan portofolio Anda telah lolos seleksi administratif, panitia
            akan menjadwalkan sesi wawancara dan mengirimkan notifikasi kepada Anda.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {interviews.map((item) => {
            const isOnline = item.type === "ONLINE";
            const dateObj = new Date(item.datetime);

            return (
              <GlassCard
                key={item.id}
                className="p-5 sm:p-7 flex flex-col gap-5 border-white/60 shadow-lg"
              >
                {/* Top Status & Date Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-[#274432]/10 text-[#274432] shrink-0">
                      {isOnline ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <MapPin className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A201C]">
                        Sesi Wawancara {isOnline ? "Daring (Online)" : "Luring (Tatap Muka)"}
                      </h3>
                      <span className="text-xs text-[#64746A] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-[#274432]" />
                        {dateObj.toLocaleString("id-ID", {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {item.status === "CONFIRMED" ? (
                      <Badge variant="DITERIMA">✓ Hadir Dikonfirmasi</Badge>
                    ) : item.status === "RESCHEDULE_REQUESTED" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-900 border border-amber-500/30">
                        <RotateCcw className="w-3 h-3 text-amber-700 animate-spin" style={{ animationDuration: "3s" }} />
                        Menunggu Reschedule
                      </span>
                    ) : item.status === "RESCHEDULE_REJECTED" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-900 border border-rose-500/30">
                        ✕ Reschedule Ditolak
                      </span>
                    ) : item.status === "COMPLETED" ? (
                      <Badge variant="DEFAULT">Selesai</Badge>
                    ) : item.status === "CANCELLED" ? (
                      <Badge variant="DITOLAK">Dibatalkan</Badge>
                    ) : (
                      <Badge variant="PENDING">Menunggu Konfirmasi</Badge>
                    )}
                  </div>
                </div>

                {/* PIC Pewawancara Field */}
                {(item.picName || item.pic?.email) && (
                  <div className="p-3.5 rounded-2xl bg-[#274432]/5 border border-[#274432]/10 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-[#274432]">
                      <UserCheck className="w-4 h-4 shrink-0" />
                      <span>
                        PIC / Pewawancara Ditugaskan:{" "}
                        <strong className="text-[#1A201C]">
                          {item.picName || item.pic?.fullName || item.pic?.email}
                        </strong>
                      </span>
                    </div>
                    {item.pic?.email && (
                      <span className="text-[11px] text-[#64746A] hidden sm:inline">
                        ({item.pic.email})
                      </span>
                    )}
                  </div>
                )}

                {/* Reschedule Banner Alerts */}
                {item.status === "RESCHEDULE_REQUESTED" && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span>Permohonan Reschedule Sedang Ditinjau Admin</span>
                    </div>
                    <p className="leading-relaxed">
                      Usulan Waktu Baru:{" "}
                      <strong>
                        {item.rescheduleProposedDate
                          ? new Date(item.rescheduleProposedDate).toLocaleString("id-ID", {
                              dateStyle: "full",
                              timeStyle: "short",
                            })
                          : "-"}
                      </strong>
                    </p>
                    {item.rescheduleReason && (
                      <p className="text-amber-800 italic">
                        Catatan Anda: &quot;{item.rescheduleReason}&quot;
                      </p>
                    )}
                  </div>
                )}

                {item.status === "RESCHEDULE_REJECTED" && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-950 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 font-bold text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-700" />
                      <span>Usulan Waktu Reschedule Tidak Disetujui Admin</span>
                    </div>
                    {item.adminRescheduleNote ? (
                      <p className="leading-relaxed bg-white/70 p-2.5 rounded-xl border border-rose-200">
                        Alasan Penolakan dari Admin:{" "}
                        <strong className="text-rose-900">&quot;{item.adminRescheduleNote}&quot;</strong>
                      </p>
                    ) : (
                      <p className="leading-relaxed">
                        Admin tidak dapat mengakomodasi waktu tersebut.
                      </p>
                    )}
                    <p className="text-[11px] text-rose-800 pt-0.5">
                      Anda dapat mengajukan usulan jadwal baru kembali sampai admin menyetujui, atau mengonfirmasi hadir pada jadwal yang telah ditetapkan.
                    </p>
                  </div>
                )}

                {/* Details Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {isOnline && item.link && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-500/20 flex flex-col gap-1 sm:col-span-2">
                      <span className="text-[#274432] font-semibold flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5" /> Tautan Google Meet / Zoom:
                      </span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-bold underline break-all hover:text-emerald-800 text-sm"
                      >
                        {item.link}
                      </a>
                    </div>
                  )}

                  {!isOnline && item.location && (
                    <div className="p-4 rounded-2xl bg-[#F5F7EC]/80 border border-black/5 flex flex-col gap-1 sm:col-span-2">
                      <span className="text-[#64746A] font-semibold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Lokasi Wawancara:
                      </span>
                      <span className="text-[#1A201C] font-bold text-sm">
                        {item.location}
                      </span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="p-4 rounded-2xl bg-white/40 border border-black/5 flex flex-col gap-1 sm:col-span-2">
                      <span className="text-[#64746A] font-semibold">
                        Catatan dari Pewawancara / Lab:
                      </span>
                      <p className="text-[#1A201C] leading-relaxed">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                {item.status !== "COMPLETED" && item.status !== "CANCELLED" && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-black/5">
                    <span className="text-xs text-[#64746A]">
                      {item.status === "CONFIRMED"
                        ? "Anda telah mengonfirmasi kehadiran. Jika berhalangan mendadak, Anda dapat mengajukan reschedule."
                        : item.status === "RESCHEDULE_REQUESTED"
                        ? "Menunggu konfirmasi admin. Anda dapat mengirim usulan baru jika diperlukan."
                        : "Konfirmasi kehadiran Anda atau ajukan waktu lain jika berhalangan."}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Tombol Ajukan Reschedule */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-amber-600/30 text-amber-900 hover:bg-amber-50"
                        onClick={() => openRescheduleModal(item)}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5 text-amber-700" />}
                      >
                        {item.status === "RESCHEDULE_REQUESTED"
                          ? "Ubah Usulan Reschedule"
                          : "Ajukan Reschedule"}
                      </Button>

                      {/* Tombol Konfirmasi Hadir */}
                      {item.status !== "CONFIRMED" && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs bg-[#274432] hover:bg-[#1e3426]"
                          isLoading={confirmMutation.isPending}
                          onClick={() => confirmMutation.mutate(item.id)}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Konfirmasi Hadir
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* MODAL AJUKAN RESCHEDULE */}
      {rescheduleModalInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#FAFBF6] border border-white/60 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-[#1A201C]">
                  Ajukan Reschedule Jadwal Wawancara
                </h3>
              </div>
              <button
                onClick={() => setRescheduleModalInterview(null)}
                className="p-1 rounded-full hover:bg-black/5 text-[#64746A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#64746A] leading-relaxed">
              Jadwal wawancara saat ini:{" "}
              <strong>
                {new Date(rescheduleModalInterview.datetime).toLocaleString("id-ID", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </strong>
              . Silakan tentukan usulan waktu baru dan berikan alasan Anda.
            </p>

            <div className="flex flex-col gap-4">
              <Input
                label="Usulan Tanggal & Jam Baru *"
                type="datetime-local"
                value={proposedDatetime}
                onChange={(e) => setProposedDatetime(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1A201C]">
                  Alasan & Ketersediaan Waktu Anda *
                </label>
                <textarea
                  rows={4}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Contoh: Mohon maaf, pada jam tersebut bertepatan dengan ujian praktikum di kampus. Saya bersedia wawancara di hari yang sama pukul 15.00 WIB atau keesokan harinya."
                  className="w-full p-3 rounded-2xl bg-white border border-black/10 text-xs text-[#1A201C] outline-hidden focus:border-[#274432] focus:ring-1 focus:ring-[#274432] resize-none"
                />
                <span className="text-[11px] text-[#64746A]">
                  Tuliskan dengan jelas rentang ketersediaan waktu Anda agar panitia dapat mencarikan slot terbaik.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRescheduleModalInterview(null)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                isLoading={rescheduleMutation.isPending}
                onClick={() => rescheduleMutation.mutate()}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Kirim Permohonan Reschedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

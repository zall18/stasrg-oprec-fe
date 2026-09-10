"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  CalendarCheck,
} from "lucide-react";

interface Interview {
  id: string;
  candidateId: string;
  datetime: string;
  type: "ONLINE" | "OFFLINE";
  link?: string;
  location?: string;
  notes?: string;
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
}

export default function CandidateInterviewsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: interviewsData, isLoading } = useQuery({
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

  const interviews = interviewsData || [];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
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
        <GlassCard className="p-12 text-center flex flex-col items-center gap-3">
          <Calendar className="w-12 h-12 text-[#64746A]/40" />
          <h3 className="text-base font-bold text-[#1A201C]">
            Belum Ada Jadwal Wawancara
          </h3>
          <p className="text-xs text-[#64746A] max-w-md leading-relaxed">
            Jika berkas dan portofolio Anda telah lolos seleksi berkas, panitia
            akan menjadwalkan sesi wawancara dan mengirimkan notifikasi kepada Anda.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {interviews.map((item) => {
            const isOnline = item.type === "ONLINE";
            const dateObj = new Date(item.datetime);

            return (
              <GlassCard
                key={item.id}
                className="p-4 sm:p-8 flex flex-col gap-5 border-white/60"
              >
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
                        <Clock className="w-3.5 h-3.5" />
                        {dateObj.toLocaleString("id-ID", {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
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
                    {item.status === "SCHEDULED"
                      ? "Menunggu Konfirmasi"
                      : item.status === "CONFIRMED"
                      ? "Hadir Dikonfirmasi"
                      : item.status === "COMPLETED"
                      ? "Selesai"
                      : "Dibatalkan"}
                  </Badge>
                </div>

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

                {/* Confirm Button if SCHEDULED */}
                {item.status === "SCHEDULED" && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-black/5">
                    <span className="text-xs text-[#64746A]">
                      Mohon konfirmasi ketersediaan hadir Anda tepat waktu.
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full sm:w-auto justify-center"
                      isLoading={confirmMutation.isPending}
                      onClick={() => confirmMutation.mutate(item.id)}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Konfirmasi Kehadiran
                    </Button>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

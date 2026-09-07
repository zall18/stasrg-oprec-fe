"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  History,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  Inbox,
  Video,
} from "lucide-react";

interface RegistrationHistoryItem {
  id: string;
  batchName: string;
  status: string;
  appliedAt: string;
  batch?: {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  };
  goldenApplication?: {
    id: string;
    status: string;
    motivasi?: string;
  } | null;
  interviews?: Array<{
    id: string;
    datetime: string;
    type: string;
    status: string;
  }>;
}

export default function CandidateHistoryPage() {
  const { data: historyData, isLoading } = useQuery({
    queryKey: ["candidateRegistrationsHistory"],
    queryFn: async () => {
      try {
        const res = await api.getRegistrationsHistory();
        const data = res.data?.data ?? res.data;
        return Array.isArray(data) ? (data as RegistrationHistoryItem[]) : [];
      } catch {
        return [] as RegistrationHistoryItem[];
      }
    },
  });

  const historyList = historyData || [];

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
              Riwayat Pendaftaran
              <History className="w-6 h-6 text-[#274432]" />
            </h1>
            <p className="text-xs text-[#64746A]">
              Arsip rekam jejak pendaftaran seleksi riset dan magang Anda di STAS-RG
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <GlassCard className="p-8 text-center text-xs text-[#64746A]">
          Memuat riwayat pendaftaran...
        </GlassCard>
      ) : historyList.length === 0 ? (
        <GlassCard className="p-12 text-center flex flex-col items-center gap-3">
          <Inbox className="w-12 h-12 text-[#64746A]/40" />
          <h3 className="text-base font-bold text-[#1A201C]">
            Belum Ada Riwayat Pendaftaran
          </h3>
          <p className="text-xs text-[#64746A] max-w-md leading-relaxed">
            Anda belum pernah mendaftar pada batch open recruitment apapun. Buka menu
            Pendaftaran Oprec untuk mendaftar pada batch yang sedang aktif.
          </p>
          <Link href="/dashboard/oprec" className="pt-2">
            <Button variant="primary" size="sm">
              Buka Pendaftaran Oprec
            </Button>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {historyList.map((item) => {
            const appliedDate = new Date(item.appliedAt);

            return (
              <GlassCard
                key={item.id}
                className="p-6 sm:p-8 flex flex-col gap-5 border-white/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-[#274432]/10 text-[#274432]">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A201C]">
                        {item.batchName || item.batch?.name || "Batch Seleksi"}
                      </h3>
                      <span className="text-xs text-[#64746A] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        Terdaftar:{" "}
                        {appliedDate.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      item.status === "DITERIMA"
                        ? "DITERIMA"
                        : item.status === "DITOLAK"
                        ? "DITOLAK"
                        : "PENDING"
                    }
                  >
                    Status: {item.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Golden Application Info if any */}
                  {item.goldenApplication && (
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-300/30 flex flex-col gap-1">
                      <span className="text-amber-900 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Jalur
                        Golden Candidate:
                      </span>
                      <span className="text-xs text-amber-950 font-medium">
                        Status: {item.goldenApplication.status}
                      </span>
                    </div>
                  )}

                  {/* Interviews Info if any */}
                  {item.interviews && item.interviews.length > 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-500/20 flex flex-col gap-1 sm:col-span-2">
                      <span className="text-[#274432] font-bold flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5" /> Sesi Wawancara Tercatat:
                      </span>
                      <div className="space-y-1 pt-1">
                        {item.interviews.map((iv) => (
                          <div
                            key={iv.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span>
                              {new Date(iv.datetime).toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}{" "}
                              ({iv.type})
                            </span>
                            <span className="font-semibold text-emerald-800">
                              {iv.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  ShieldCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ActivityLogItem {
  id: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
  createdAt: string;
  user?: {
    email: string;
    role: string;
  };
}

export default function AdminActivityLogsPage() {
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: logsResponse, isLoading } = useQuery({
    queryKey: ["adminActivityLogs", actionFilter, page],
    queryFn: async () => {
      try {
        const res = await api.getActivityLogs({
          action: actionFilter || undefined,
          page,
          limit,
        });
        return res.data;
      } catch {
        return { data: [], meta: { total: 0, totalPages: 1, page: 1 } };
      }
    },
  });

  const logs: ActivityLogItem[] = Array.isArray(logsResponse?.data)
    ? logsResponse.data
    : [];

  const meta = logsResponse?.meta || {
    total: logs.length,
    totalPages: Math.max(1, Math.ceil(logs.length / limit)),
    page: 1,
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("ACTIVATE") || action.includes("ACCEPTED"))
      return "DITERIMA";
    if (action.includes("REJECT") || action.includes("CANCEL")) return "DITOLAK";
    if (action.includes("GOLDEN")) return "GOLDEN";
    return "DEFAULT";
  };

  const formatLogDetails = (rawDetails?: string | null, _action?: string): string => {
    if (!rawDetails) return "-";
    const str = String(rawDetails).trim();
    if (!str) return "-";

    if ((str.startsWith("{") && str.endsWith("}")) || (str.startsWith("[") && str.endsWith("]"))) {
      try {
        const parsed = JSON.parse(str);
        if (typeof parsed === "object" && parsed !== null) {
          const parts: string[] = [];

          if (parsed.status) parts.push(`Status: ${parsed.status}`);
          if (parsed.assignedProject) parts.push(`Proyek: ${parsed.assignedProject}`);
          if (parsed.batchName || parsed.batch) parts.push(`Batch: ${parsed.batchName || parsed.batch}`);
          if (parsed.email) parts.push(`Email: ${parsed.email}`);
          if (parsed.title) parts.push(`Judul: "${parsed.title}"`);
          if (parsed.candidateName) parts.push(`Kandidat: ${parsed.candidateName}`);
          if (parsed.count !== undefined) parts.push(`Jumlah: ${parsed.count}`);
          if (parsed.datetime) {
            const dateStr = new Date(parsed.datetime).toLocaleString("id-ID", {
              dateStyle: "short",
              timeStyle: "short",
            });
            parts.push(`Waktu: ${dateStr}`);
          }
          if (parsed.type) parts.push(`Tipe: ${parsed.type}`);
          if (parsed.reason) parts.push(`Alasan: ${parsed.reason}`);
          if (parsed.message) parts.push(String(parsed.message));

          if (parts.length > 0) {
            return parts.join(" • ");
          }

          const entries = Object.entries(parsed)
            .filter(([, v]) => typeof v === "string" || typeof v === "number" || typeof v === "boolean")
            .map(([k, v]) => `${k}: ${v}`);
          if (entries.length > 0) {
            return entries.join(" • ");
          }
        }
      } catch {
        // Not valid JSON, return original str
      }
    }

    return str;
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A201C] flex items-center gap-2">
          Log Aktivitas & Audit Trail
          <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-[#274432]" />
        </h1>
        <p className="text-xs text-[#64746A]">
          Riwayat pencatatan seluruh tindakan administratif dalam sistem seleksi STAS-RG
        </p>
      </div>

      {/* Filter Bar */}
      <GlassCard className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#64746A] whitespace-nowrap">
            Filter Aksi:
          </span>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-white/60 border border-black/10 text-xs text-[#1A201C] outline-hidden"
          >
            <option value="">Semua Aksi</option>
            <option value="SCHEDULE_INTERVIEW">Jadwal Wawancara</option>
            <option value="UPDATE_STATUS">Perubahan Status</option>
            <option value="BULK_STATUS">Perubahan Status Massal</option>
            <option value="ACTIVATE_BATCH">Aktivasi Batch</option>
            <option value="ADD_NOTE">Catatan Ditambahkan</option>
            <option value="CREATE_ANNOUNCEMENT">Pembuatan Pengumuman</option>
          </select>
        </div>

        <span className="text-xs text-[#64746A]">
          Total {meta.total} rekaman audit
        </span>
      </GlassCard>

      {/* Logs Table */}
      <GlassCard className="overflow-hidden p-0 border-white/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-black/10 bg-white/40 text-[#274432] uppercase tracking-wider font-bold">
                <th className="py-4 px-5">Waktu</th>
                <th className="py-4 px-5">Pengguna (Admin)</th>
                <th className="py-4 px-5">Jenis Aksi</th>
                <th className="py-4 px-5">Target Entitas</th>
                <th className="py-4 px-5">Rincian / Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#64746A]">
                    Memuat log aktivitas...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#64746A]">
                    Belum ada riwayat aktivitas yang tercatat.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/40 transition-colors">
                    <td className="py-4 px-5 whitespace-nowrap text-[#64746A]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#274432]" />
                        {new Date(log.createdAt).toLocaleString("id-ID", {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-5 font-semibold text-[#1A201C]">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{log.user?.email || "System"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-[#64746A]">
                      {log.targetType || "-"}
                    </td>
                    <td className="py-4 px-5 text-[#1A201C] max-w-sm" title={log.details || ""}>
                      <span className="line-clamp-2 leading-relaxed">
                        {formatLogDetails(log.details, log.action)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-black/5 text-xs text-[#64746A]">
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

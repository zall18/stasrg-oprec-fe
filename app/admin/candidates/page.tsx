"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminCandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "GOLDEN" | "OPREC">("ALL");
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
    isGolden:
      activeTab === "GOLDEN" ? "true" : activeTab === "OPREC" ? "false" : undefined,
    page,
    limit,
  };

  const { data: rawResponse, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["adminCandidates", debouncedSearch, activeTab, page],
    queryFn: async () => {
      const res = await api.getCandidates(queryParams);
      return res.data;
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
      <GlassCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Cari nama, NIM, email, atau universitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64746A]">
          <span>Menampilkan {candidates.length} dari {meta.total} pendaftar</span>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-black/5 rounded-full text-[#274432] transition-colors cursor-pointer"
            title="Muat ulang data"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
          </button>
        </div>
      </GlassCard>

      {/* Candidate Data Table */}
      <GlassCard className="overflow-hidden p-0 border-white/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-white/40 text-[#274432] uppercase tracking-wider font-bold">
                <th className="py-4 px-6">Kandidat</th>
                <th className="py-4 px-6">NIM & Prodi</th>
                <th className="py-4 px-6">Universitas</th>
                <th className="py-4 px-6">Role Minat</th>
                <th className="py-4 px-6">Status Seleksi</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64746A]">
                    Memuat data kandidat...
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64746A]">
                    Tidak ditemukan data pendaftar yang sesuai.
                  </td>
                </tr>
              ) : (
                candidates.map((item: any) => {
                  const cand = item.candidate || item;
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
                  const email = cand.user?.email || cand.email || item.email || "-";
                  const nim = cand.nim || item.nim || "-";
                  const prodi = cand.programStudi || item.programStudi || "-";
                  const univ = cand.universitas || item.universitas || "-";
                  const role = cand.roleInterest || item.roleInterest || "RISET";
                  const status: BadgeVariant =
                    (item.status || cand.status || "PENDING") as BadgeVariant;
                  
                  // Registration ID or Candidate ID for detail navigation
                  const targetId = item.id || cand.id;

                  return (
                    <tr
                      key={targetId}
                      className="hover:bg-white/40 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#1A201C]">
                            {name}
                          </span>
                          {isGolden && (
                            <Badge variant="GOLDEN">★ Golden</Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-[#64746A]">
                          {email}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-medium text-[#1A201C] block">
                          {nim}
                        </span>
                        <span className="text-[11px] text-[#64746A]">
                          {prodi}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-medium text-[#1A201C]">
                        {univ}
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant="DEFAULT">{role}</Badge>
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant={status}>{status}</Badge>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Link href={`/admin/candidates/${targetId}`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Detail & Aksi
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
          <div className="flex items-center justify-between p-4 border-t border-black/5 bg-white/20">
            <span className="text-xs text-[#64746A]">
              Halaman {meta.page} dari {meta.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

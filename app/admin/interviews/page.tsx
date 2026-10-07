"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
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
  candidate?: {
    id: string;
    fullName?: string;
    universitas?: string;
    user?: { email: string };
  };
}

export default function AdminInterviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-xs text-[#64746A]">
          Memuat halaman jadwal wawancara...
        </div>
      }
    >
      <AdminInterviewsContent />
    </Suspense>
  );
}

function AdminInterviewsContent() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const urlCandidateId = searchParams?.get("candidateId");

  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<AdminInterview | null>(
    null
  );

  // Reject reschedule modal state
  const [rejectModalInterview, setRejectModalInterview] =
    useState<AdminInterview | null>(null);
  const [rejectAdminNote, setRejectAdminNote] = useState("");

  // Form states
  const [candidateId, setCandidateId] = useState("");
  const [datetime, setDatetime] = useState("");
  const [type, setType] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [link, setLink] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [picName, setPicName] = useState("");

  // Auto-select candidate and open modal if navigated from candidate detail page
  useEffect(() => {
    if (urlCandidateId) {
      setCandidateId(urlCandidateId);
      setDatetime(new Date().toISOString().slice(0, 16));
      setType("ONLINE");
      setLink("https://meet.google.com/");
      setLocation("");
      setNotes("");
      setPicName("");
      setIsModalOpen(true);
    }
  }, [urlCandidateId]);

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

  // Query candidates for select dropdown (fetch both regular and golden candidates)
  const { data: candidatesData } = useQuery({
    queryKey: ["adminCandidateOptions"],
    queryFn: async () => {
      try {
        const [regRes, goldenRes] = await Promise.allSettled([
          api.getCandidates({ limit: 100, isGolden: "false" }),
          api.getCandidates({ limit: 100, isGolden: "true" }),
        ]);

        const regList =
          regRes.status === "fulfilled"
            ? Array.isArray(regRes.value.data?.data)
              ? regRes.value.data.data
              : regRes.value.data?.data?.candidates || []
            : [];

        const goldenList =
          goldenRes.status === "fulfilled"
            ? Array.isArray(goldenRes.value.data?.data)
              ? goldenRes.value.data.data
              : goldenRes.value.data?.data?.candidates || []
            : [];

        const map = new Map<string, any>();

        const processItem = (item: any, isGolden: boolean) => {
          if (!item) return;
          const cand = item.candidate || item.profile || item;
          const userObj = cand.user || item.user || {};
          const profileObj = cand.profile || item.profile || {};

          // Resolve true Candidate ID
          const resolvedId =
            cand.id ||
            item.candidateId ||
            item.userId ||
            userObj.id ||
            item.id;

          const fullName =
            cand.fullName ||
            profileObj.fullName ||
            item.fullName ||
            cand.name ||
            userObj.fullName ||
            userObj.name ||
            userObj.email ||
            cand.email ||
            item.email ||
            "Kandidat";

          const universitas =
            cand.universitas ||
            profileObj.universitas ||
            item.universitas ||
            cand.university ||
            "";

          if (resolvedId && !map.has(resolvedId)) {
            map.set(resolvedId, {
              id: resolvedId,
              altId: item.id !== resolvedId ? item.id : undefined,
              registrationId: item.registrationId || item.id,
              fullName,
              universitas,
              isGoldenCandidate: isGolden,
            });
          }
        };

        regList.forEach((c: any) => processItem(c, false));
        goldenList.forEach((c: any) => processItem(c, true));

        // Deduplicate distinct candidates for dropdown
        const uniqueCandidates: any[] = [];
        const seen = new Set<string>();
        for (const candidate of map.values()) {
          if (!seen.has(candidate.id)) {
            seen.add(candidate.id);
            uniqueCandidates.push(candidate);
          }
        }

        return uniqueCandidates;
      } catch {
        return [];
      }
    },
  });

  const candidateLookup = React.useMemo(() => {
    const lookup = new Map<string, any>();
    if (!candidatesData) return lookup;
    candidatesData.forEach((c: any) => {
      lookup.set(c.id, c);
      if (c.altId) lookup.set(c.altId, c);
      if (c.registrationId) lookup.set(c.registrationId, c);
    });
    return lookup;
  }, [candidatesData]);

  const openCreateModal = () => {
    setEditingInterview(null);
    setCandidateId(candidatesData?.[0]?.id || "");
    setDatetime(new Date().toISOString().slice(0, 16));
    setType("ONLINE");
    setLink("https://meet.google.com/");
    setLocation("");
    setNotes("");
    setPicName("");
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
    setPicName(iv.picName || "");
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
        picName: picName.trim() || undefined,
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

  // Approve Reschedule Mutation
  const approveRescheduleMutation = useMutation({
    mutationFn: async ({ id, datetime }: { id: string; datetime?: string }) => {
      return api.approveReschedule(id, { datetime });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInterviews"] });
      toast.success("Permohonan reschedule disetujui! Jadwal telah diperbarui.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menyetujui reschedule");
    },
  });

  // Reject Reschedule Mutation
  const rejectRescheduleMutation = useMutation({
    mutationFn: async () => {
      if (!rejectModalInterview) return;
      if (!rejectAdminNote.trim() || rejectAdminNote.trim().length < 5) {
        throw new Error("Catatan alasan penolakan minimal 5 karakter.");
      }
      return api.rejectReschedule(rejectModalInterview.id, {
        adminNote: rejectAdminNote.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInterviews"] });
      toast.success("Permohonan reschedule ditolak dan catatan telah dikirim ke kandidat.");
      setRejectModalInterview(null);
      setRejectAdminNote("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menolak reschedule");
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
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A201C] flex items-center gap-2">
            Penjadwalan Wawancara
            <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#274432]" />
          </h1>
          <p className="text-xs text-[#64746A]">
            Atur dan kelola sesi wawancara, penugasan PIC pewawancara, serta tanggapi permohonan reschedule kandidat
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-md"
          >
            Buat Jadwal Wawancara
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <GlassCard className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-white/60">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#274432]" />
          <span className="text-xs font-bold text-[#1A201C]">
            Filter Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-2xl bg-white/70 border border-black/10 text-xs text-[#1A201C] outline-hidden"
          >
            <option value="">Semua Status Wawancara</option>
            <option value="RESCHEDULE_REQUESTED">⚠️ Menunggu Reschedule (Kandidat)</option>
            <option value="SCHEDULED">Scheduled (Menunggu Konfirmasi)</option>
            <option value="CONFIRMED">Confirmed (Hadir Dikonfirmasi)</option>
            <option value="RESCHEDULE_REJECTED">Reschedule Ditolak</option>
            <option value="COMPLETED">Completed (Selesai)</option>
            <option value="CANCELLED">Cancelled (Dibatalkan)</option>
          </select>
        </div>

        <span className="text-xs text-[#64746A]">
          Total: <strong>{interviews.length}</strong> sesi wawancara
        </span>
      </GlassCard>

      {/* Interviews Grid */}
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
          <p className="text-xs text-[#64746A] max-w-sm">
            Klik tombol "Buat Jadwal Wawancara" di atas untuk menambahkan sesi baru bagi kandidat.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {interviews.map((item) => {
            const isOnline = item.type === "ONLINE";
            const dateObj = new Date(item.datetime);
            const candRel: any = item.candidate || {};
            const candProfile = candRel.profile || {};
            const candUser = candRel.user || {};
            const lookup =
              candidateLookup.get(item.candidateId) ||
              (candRel.id ? candidateLookup.get(candRel.id) : undefined);

            const candName =
              candRel.fullName ||
              candProfile.fullName ||
              (candRel as any).name ||
              lookup?.fullName ||
              candUser.fullName ||
              candUser.email ||
              (candRel as any).email ||
              (item.candidateId ? `Kandidat #${item.candidateId.slice(0, 8)}` : "Kandidat");

            const candUniv =
              candRel.universitas ||
              candProfile.universitas ||
              (candRel as any).university ||
              lookup?.universitas ||
              "";

            const isRescheduleReq = item.status === "RESCHEDULE_REQUESTED";

            return (
              <GlassCard
                key={item.id}
                className={cn(
                  "p-4 sm:p-6 flex flex-col justify-between gap-4 border-white/60 hover:shadow-md transition-all",
                  isRescheduleReq && "ring-2 ring-amber-500/50 bg-amber-50/40 border-amber-400"
                )}
              >
                <div className="flex flex-col gap-3">
                  {/* Top Candidate & Status Badge */}
                  <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432] shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#1A201C] truncate">
                          {candName}
                        </h4>
                        <span className="text-[11px] text-[#64746A] truncate block">
                          {candUniv || (lookup?.isGoldenCandidate ? "Golden Candidate" : "STAS-RG Candidate")}
                        </span>
                      </div>
                    </div>

                    <div>
                      {item.status === "CONFIRMED" ? (
                        <Badge variant="DITERIMA">Confirmed</Badge>
                      ) : item.status === "RESCHEDULE_REQUESTED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
                          <RotateCcw className="w-3 h-3 animate-spin" style={{ animationDuration: "3s" }} />
                          Minta Reschedule
                        </span>
                      ) : item.status === "RESCHEDULE_REJECTED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          Reschedule Ditolak
                        </span>
                      ) : item.status === "COMPLETED" ? (
                        <Badge variant="DEFAULT">Completed</Badge>
                      ) : item.status === "CANCELLED" ? (
                        <Badge variant="DITOLAK">Cancelled</Badge>
                      ) : (
                        <Badge variant="PENDING">Scheduled</Badge>
                      )}
                    </div>
                  </div>

                  {/* PIC Info */}
                  <div className="flex items-center gap-1.5 text-xs text-[#274432] bg-[#274432]/5 px-2.5 py-1.5 rounded-xl border border-[#274432]/10">
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      PIC:{" "}
                      <strong className="text-[#1A201C]">
                        {item.picName || item.pic?.fullName || item.pic?.email || "Belum ditentukan"}
                      </strong>
                    </span>
                  </div>

                  {/* Time & Location */}
                  <div className="flex items-center gap-2 text-xs text-[#1A201C] pt-1">
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

                  {/* Candidate Reschedule Banner if RESCHEDULE_REQUESTED */}
                  {isRescheduleReq && (
                    <div className="p-3 rounded-2xl bg-amber-100/80 border border-amber-300 text-xs text-amber-950 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Kandidat Mengajukan Reschedule:</span>
                      </div>
                      <p className="text-[11px] font-semibold">
                        Usulan:{" "}
                        {item.rescheduleProposedDate
                          ? new Date(item.rescheduleProposedDate).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "-"}
                      </p>
                      {item.rescheduleReason && (
                        <p className="text-[11px] italic text-amber-900">
                          &quot;{item.rescheduleReason}&quot;
                        </p>
                      )}

                      {/* Approval / Rejection Buttons */}
                      <div className="flex items-center gap-2 pt-1 border-t border-amber-300/60">
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-[11px] py-1 px-2.5 h-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                          isLoading={approveRescheduleMutation.isPending}
                          onClick={() =>
                            approveRescheduleMutation.mutate({
                              id: item.id,
                              datetime: item.rescheduleProposedDate,
                            })
                          }
                          leftIcon={<CheckCircle2 className="w-3 h-3" />}
                        >
                          Setujui
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[11px] py-1 px-2.5 h-auto border-rose-300 text-rose-800 hover:bg-rose-50 font-bold"
                          onClick={() => {
                            setRejectModalInterview(item);
                            setRejectAdminNote("");
                          }}
                          leftIcon={<XCircle className="w-3 h-3" />}
                        >
                          Tolak
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Rejection Note if RESCHEDULE_REJECTED */}
                  {item.status === "RESCHEDULE_REJECTED" && item.adminRescheduleNote && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900">
                      <strong>Reschedule Ditolak:</strong> {item.adminRescheduleNote}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-[#64746A] italic bg-white/40 p-2.5 rounded-xl border border-black/5">
                      &quot;{item.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-black/5">
                  <Link
                    href={`/admin/candidates/${lookup?.id || item.candidateId}?tab=${
                      lookup?.isGoldenCandidate ? "GOLDEN" : "OPREC"
                    }`}
                  >
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

      {/* SCHEDULE INTERVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/80 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
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
                          {c.fullName}{c.universitas ? ` (${c.universitas})` : ""}{" "}
                          {c.isGoldenCandidate ? "★ [Golden Ticket]" : ""}
                        </option>
                      ))
                    ) : (
                      <option value="">Tidak ada kandidat</option>
                    )}
                    {urlCandidateId &&
                      !candidatesData?.some(
                        (c: any) => c.id === urlCandidateId || c.altId === urlCandidateId
                      ) && (
                        <option value={urlCandidateId}>
                          {candidateLookup.get(urlCandidateId)?.fullName ||
                            `Kandidat Terpilih (${urlCandidateId.slice(0, 8)}...)`}
                        </option>
                      )}
                  </select>
                </div>
              )}

              {/* PIC Field */}
              <Input
                label="Nama PIC Pewawancara (Opsional)"
                placeholder="Contoh: Dr. Budi / Kak Kevin"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
              />

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
                Simpan Jadwal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT RESCHEDULE MODAL */}
      {rejectModalInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white/80 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2 text-rose-800">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-[#1A201C]">
                  Tolak Permohonan Reschedule
                </h3>
              </div>
              <button
                onClick={() => setRejectModalInterview(null)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#64746A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64746A] leading-relaxed">
              Berikan catatan alasan penolakan kepada kandidat (misal slot waktu pewawancara penuh, atau sarankan waktu lain):
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1A201C]">
                Catatan Alasan Penolakan *
              </label>
              <textarea
                rows={3}
                value={rejectAdminNote}
                onChange={(e) => setRejectAdminNote(e.target.value)}
                placeholder="Contoh: Maaf, pada jam tersebut PIC sedang rapat akademik. Silakan ajukan waktu lain di hari kerja pukul 09.00 - 16.00 WIB."
                className="w-full p-3 rounded-2xl bg-black/[0.02] border border-black/10 text-xs text-[#1A201C] outline-hidden focus:border-rose-600 focus:ring-1 focus:ring-rose-600 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModalInterview(null)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-700 hover:bg-rose-800 text-white"
                isLoading={rejectRescheduleMutation.isPending}
                onClick={() => rejectRescheduleMutation.mutate()}
              >
                Kirim Penolakan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

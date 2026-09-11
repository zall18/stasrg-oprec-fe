"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Calendar,
  Info,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function OprecApplyPage() {
  const toast = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const { data: pageData, isLoading } = useQuery({
    queryKey: ["oprecPageData"],
    queryFn: async () => {
      const [statusRes, goldenRes, regRes] = await Promise.allSettled([
        api.getOprecStatus(),
        api.getGoldenApplication(),
        api.getRegistrationsHistory(),
      ]);

      const oprec = statusRes.status === "fulfilled" ? statusRes.value.data?.data : null;
      const golden = goldenRes.status === "fulfilled" ? goldenRes.value.data?.data : null;
      const regs = regRes.status === "fulfilled" && Array.isArray(regRes.value.data?.data) ? regRes.value.data.data : [];

      return { oprec, golden, regs };
    },
  });

  const oprec = pageData?.oprec;
  const isActive = Boolean(
    oprec?.isOprecActive ?? oprec?.isActive ?? false
  );

  const isBlockedByGolden = pageData?.golden && pageData?.golden.status !== "REJECTED";
  const isBlockedByReg = pageData?.regs.some((r: any) => r.batch?.name === oprec?.currentBatch);
  const isBlocked = isBlockedByGolden || isBlockedByReg || hasApplied;

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await api.applyOprec(oprec?.currentBatch);
      setHasApplied(true);
      toast.success(
        `Pendaftaran Oprec ${oprec?.currentBatch || "STAS-RG"} berhasil dikirim!`
      );
    } catch (err: any) {
      toast.error(
        err.message ||
          "Gagal mendaftar oprec. Pastikan Anda telah melengkapi data profil terlebih dahulu."
      );
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A201C] flex items-center gap-2">
          Pendaftaran Open Recruitment (Oprec)
          <Rocket className="w-6 h-6 text-[#274432]" />
        </h1>
        <p className="text-xs sm:text-sm text-[#64746A]">
          Pendaftaran terpusat untuk program seleksi berkas dan wawancara lab STAS-RG.
        </p>
      </div>

      {isLoading ? (
        <GlassCard className="p-8 text-center text-xs text-[#64746A]">
          Memeriksa status batch seleksi dari server...
        </GlassCard>
      ) : isActive ? (
        <GlassCard className="p-4 sm:p-8 flex flex-col gap-6 border-white/60">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
              </span>
              <span className="text-sm font-bold text-[#1A201C]">
                Batch Dibuka: {oprec?.currentBatch || "Perekrutan Reguler"}
              </span>
            </div>
            <Badge variant="DITERIMA">Status Aktif</Badge>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#1A201C]">
              Deskripsi Rekrutmen
            </h2>
            <p className="text-xs sm:text-sm text-[#64746A] leading-relaxed">
              {oprec?.description ||
                "Seleksi dibuka untuk seluruh mahasiswa yang berminat mengembangkan sistem otonom dan kendaraan pintar. Tahapan seleksi mencakup review berkas CV dan transkrip, dilanjutkan sesi wawancara."}
            </p>
          </div>

          {(oprec?.startDate || oprec?.endDate) && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-[#F5F7EC]/60 border border-black/5 text-xs text-[#1A201C]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#274432] shrink-0" />
                  <span>
                    <strong>Mulai:</strong>{" "}
                    {oprec?.startDate
                      ? new Date(oprec.startDate).toLocaleDateString("id-ID")
                      : "Segera"}
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#274432] shrink-0" />
                  <span>
                    <strong>Batas Akhir:</strong>{" "}
                    {oprec?.endDate
                      ? new Date(oprec.endDate).toLocaleDateString("id-ID")
                      : "Hingga kuota terpenuhi"}
                  </span>
                </div>
              </div>

              {/* Countdown Banner */}
              {oprec?.endDate && (
                <div className="p-4 rounded-2xl bg-[#274432]/5 border border-[#274432]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#274432]">
                    Batas Pendaftaran Berakhir:
                  </span>
                  <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full bg-[#274432] text-white">
                    {new Date(oprec.endDate) > new Date()
                      ? `${Math.ceil((new Date(oprec.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Hari Lagi`
                      : "Pendaftaran Ditutup"}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-white/40 border border-black/5 flex items-start gap-3 text-xs text-[#64746A]">
            <Info className="w-4 h-4 text-[#274432] shrink-0 mt-0.5" />
            <span>
              Pastikan profil Anda di menu <strong>Profil Saya</strong>{" "}
              sudah terisi lengkap dengan CV terbaru sebelum menekan tombol pendaftaran.
            </span>
          </div>

          {(isBlockedByGolden || isBlockedByReg) && !hasApplied && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-500/20 flex flex-col gap-2 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertCircle className="w-4 h-4" />
                Pendaftaran Tidak Tersedia
              </div>
              <p className="text-xs text-amber-800/80">
                {isBlockedByGolden
                  ? "Anda memiliki aplikasi Golden Candidate yang sedang diproses atau telah diterima. Anda tidak dapat mendaftar Oprec Reguler."
                  : `Anda sudah terdaftar untuk batch ${oprec?.currentBatch || "ini"}.`}
              </p>
            </div>
          )}

          {hasApplied ? (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-500/30 text-emerald-950">
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold">Pendaftaran Berhasil Dikirim!</span>
                <span className="text-[11px] text-emerald-800">
                  Data Anda sedang dalam antrean seleksi berkas oleh tim PIC Lab.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto justify-center disabled:opacity-50"
                isLoading={isApplying}
                disabled={isBlocked}
                onClick={handleApply}
                rightIcon={<Rocket className="w-4 h-4" />}
              >
                Daftar Oprec Sekarang
              </Button>
            </div>
          )}
        </GlassCard>
      ) : (
        <GlassCard className="p-8 flex flex-col items-center justify-center gap-4 text-center border-white/60">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h2 className="text-lg font-bold text-[#1A201C]">
              Periode Pendaftaran Reguler Belum Dibuka
            </h2>
            <p className="text-xs text-[#64746A] leading-relaxed">
              Saat ini belum ada batch Open Recruitment yang aktif. Namun, Anda
              tetap dapat mengajukan portofolio melalui jalur prioritas{" "}
              <strong>Golden Candidate</strong> kapan saja.
            </p>
          </div>
          <Link href="/dashboard/golden-candidate" className="pt-2">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Ajukan Golden Candidate
            </Button>
          </Link>
        </GlassCard>
      )}
    </div>
  );
}

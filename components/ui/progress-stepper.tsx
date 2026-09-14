import React from "react";
import { CheckCircle2, Clock, XCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectionStatus =
  | "PENDING"
  | "SELEKSI_BERKAS"
  | "WAWANCARA_1"
  | "WAWANCARA_2"
  | "DITERIMA"
  | "DITOLAK";

interface ProgressStepperProps {
  currentStatus: SelectionStatus;
  className?: string;
}

const STAGES: { key: SelectionStatus; label: string; desc: string }[] = [
  { key: "PENDING", label: "Pendaftaran", desc: "Berkas diterima sistem" },
  { key: "SELEKSI_BERKAS", label: "Seleksi Berkas", desc: "Verifikasi dokumen & portofolio" },
  { key: "WAWANCARA_1", label: "Wawancara 1", desc: "Tanya jawab teknis & minat" },
  { key: "WAWANCARA_2", label: "Wawancara 2", desc: "Wawancara pimpinan & matching" },
  { key: "DITERIMA", label: "Hasil Akhir", desc: "Pengumuman kelulusan riset" },
];

export function ProgressStepper({ currentStatus, className }: ProgressStepperProps) {
  const isRejected = currentStatus === "DITOLAK";
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  if (isRejected) {
    return (
      <div
        data-testid="progress-stepper"
        className={cn(
          "p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-red-50/80 border border-red-200/70 backdrop-blur-md",
          className
        )}
      >
        <div className="flex items-center gap-3 text-red-800 font-semibold mb-2">
          <XCircle className="w-6 h-6 text-red-600 shrink-0" />
          <span>Status Seleksi: Belum Memenuhi Kualifikasi</span>
        </div>
        <p className="text-xs text-red-700/80 leading-relaxed ml-9">
          Terima kasih telah berpartisipasi dalam Open Recruitment STAS-RG. Tetap semangat,
          kembangkan portofolio Anda, dan Anda dipersilakan mencoba kembali pada batch berikutnya.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="progress-stepper"
      className={cn(
        "p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/60 border border-white/80 shadow-xs backdrop-blur-md",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h4 className="text-sm font-bold text-[#1A201C]">
            Tahapan Proses Seleksi
          </h4>
          <p className="text-xs text-[#64746A]">
            Pantau perkembangan posisi aplikasi seleksi Anda secara real-time
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full bg-[#274432]/10 text-[#274432]">
          Langkah {activeIndex + 1} dari {STAGES.length}
        </span>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 relative">
        {STAGES.map((stage, idx) => {
          const isPassed = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isUpcoming = idx > activeIndex;

          return (
            <div
              key={stage.key}
              data-testid={`step-${stage.key}`}
              className={cn(
                "flex flex-col p-4 rounded-2xl border transition-all duration-200",
                isCurrent &&
                  "bg-[#274432]/5 border-[#274432]/30 shadow-xs ring-1 ring-[#274432]/20",
                isPassed && "bg-white/40 border-emerald-500/20",
                isUpcoming && "bg-black/[0.02] border-black/5 opacity-60"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                    isPassed && "bg-emerald-700 text-white",
                    isCurrent && "bg-[#274432] text-white shadow-xs",
                    isUpcoming && "bg-black/10 text-[#64746A]"
                  )}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 animate-pulse" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < STAGES.length - 1 && (
                  <ChevronRight className="hidden md:block w-4 h-4 text-black/20" />
                )}
              </div>

              <span
                className={cn(
                  "text-xs font-bold mb-0.5",
                  isCurrent ? "text-[#274432]" : "text-[#1A201C]"
                )}
              >
                {stage.label}
              </span>
              <span className="text-[11px] text-[#64746A] leading-tight">
                {stage.desc}
              </span>

              {isCurrent && (
                <span className="mt-3 inline-flex items-center text-[10px] font-semibold text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-ping" />
                  Sedang Berlangsung
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type GoldenSelectionStatus =
  | "PENDING"
  | "ADMINISTRATIVE"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED";

interface GoldenProgressStepperProps {
  currentStatus: GoldenSelectionStatus | string;
  className?: string;
}

const GOLDEN_STAGES: { key: GoldenSelectionStatus; label: string; desc: string }[] = [
  { key: "PENDING", label: "Aplikasi Diajukan", desc: "Formulir & berkas tersimpan" },
  { key: "ADMINISTRATIVE", label: "Seleksi Berkas", desc: "Verifikasi portofolio & esai" },
  { key: "INTERVIEW", label: "Wawancara Khusus", desc: "Sesi fast-track riset lab" },
  { key: "ACCEPTED", label: "Diterima Golden", desc: "Alokasi penugasan proyek lab" },
];

export function GoldenProgressStepper({
  currentStatus,
  className,
}: GoldenProgressStepperProps) {
  const isRejected = currentStatus === "REJECTED";
  const currentIndex = GOLDEN_STAGES.findIndex((s) => s.key === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  if (isRejected) {
    return (
      <div
        data-testid="golden-progress-stepper"
        className={cn(
          "p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-amber-50/80 border border-amber-300/60 backdrop-blur-md",
          className
        )}
      >
        <div className="flex items-center gap-3 text-amber-900 font-bold mb-2">
          <XCircle className="w-6 h-6 text-amber-700 shrink-0" />
          <span>Status Seleksi: Belum Memenuhi Kualifikasi Jalur Golden</span>
        </div>
        <p className="text-xs text-amber-800/80 leading-relaxed ml-9">
          Terima kasih atas ketertarikan Anda mendaftar melalui jalur Golden Candidate.
          Aplikasi Anda saat ini belum memenuhi kriteria fast-track dan dialihkan untuk pertimbangan seleksi reguler.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="golden-progress-stepper"
      className={cn(
        "p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-amber-500/10 border border-amber-500/20 shadow-xs backdrop-blur-md",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-900">
              Jalur Golden Candidate
            </span>
          </div>
          <h4 className="text-sm font-bold text-amber-950">
            Tahapan Seleksi Golden Ticket
          </h4>
          <p className="text-xs text-amber-900/70">
            Pantau posisi peninjauan berkas & wawancara prioritas Anda
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-amber-600 text-white shadow-xs">
          Langkah {activeIndex + 1} dari {GOLDEN_STAGES.length}
        </span>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 relative">
        {GOLDEN_STAGES.map((stage, idx) => {
          const isPassed = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isUpcoming = idx > activeIndex;

          return (
            <div
              key={stage.key}
              data-testid={`golden-step-${stage.key}`}
              className={cn(
                "flex flex-col p-4 rounded-2xl border transition-all duration-200",
                isCurrent &&
                  "bg-white/80 border-amber-500/50 shadow-md ring-2 ring-amber-500/30",
                isPassed && "bg-white/40 border-amber-500/20",
                isUpcoming && "bg-black/[0.02] border-black/5 opacity-60"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                    isPassed && "bg-amber-600 text-white",
                    isCurrent && "bg-amber-700 text-white shadow-xs",
                    isUpcoming && "bg-black/10 text-[#64746A]"
                  )}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 animate-pulse" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < GOLDEN_STAGES.length - 1 && (
                  <ChevronRight className="hidden md:block w-4 h-4 text-black/20" />
                )}
              </div>

              <span
                className={cn(
                  "text-xs font-bold mb-0.5",
                  isCurrent ? "text-amber-950" : "text-[#1A201C]"
                )}
              >
                {stage.label}
              </span>
              <span className="text-[11px] text-[#64746A] leading-tight">
                {stage.desc}
              </span>

              {isCurrent && (
                <span className="mt-3 inline-flex items-center text-[10px] font-semibold text-amber-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5 animate-ping" />
                  Tahap Saat Ini
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

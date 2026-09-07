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
          "p-6 rounded-3xl bg-red-50/80 border border-red-200/70 backdrop-blur-md",
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
        "p-6 rounded-3xl bg-white/60 border border-white/80 shadow-xs backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-bold text-[#1A201C]">
            Tahapan Proses Seleksi
          </h4>
          <p className="text-xs text-[#64746A]">
            Pantau perkembangan posisi aplikasi seleksi Anda secara real-time
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#274432]/10 text-[#274432]">
          Langkah {activeIndex + 1} dari {STAGES.length}
        </span>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
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

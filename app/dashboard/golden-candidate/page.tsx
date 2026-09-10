"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  ArrowLeft,
  Sparkles,
  Award,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface GoldenFormData {
  motivasi: string;
  pencapaian: string;
  rekomendasi?: string;
}

export default function GoldenCandidatePage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingGoldenApp, setExistingGoldenApp] = useState<any>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GoldenFormData>({
    defaultValues: {
      motivasi: "",
      pencapaian: "",
      rekomendasi: "",
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, goldenRes] = await Promise.allSettled([
          api.getCandidateProfile(),
          api.getGoldenApplication(),
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value.data?.data) {
          const p = profileRes.value.data.data;
          // Check if profile is complete
          if (p.fullName && p.nim && p.cvUrl) {
            setIsProfileComplete(true);
          }
        }

        if (goldenRes.status === "fulfilled" && goldenRes.value.data?.data) {
          const g = goldenRes.value.data.data;
          setExistingGoldenApp(g);
          setValue("motivasi", g.motivasi || "");
          setValue("pencapaian", g.pencapaian || "");
          setValue("rekomendasi", g.rekomendasi || "");
        }
      } catch (error) {
        // Ignored
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [setValue]);

  const onSubmit = async (values: GoldenFormData) => {
    setIsSubmitting(true);
    try {
      const goldenPayload = {
        motivasi: values.motivasi,
        pencapaian: values.pencapaian,
        rekomendasi: values.rekomendasi || undefined,
      };

      if (existingGoldenApp?.id) {
        await api.updateGoldenApplication(goldenPayload);
      } else {
        await api.submitGoldenApplication(goldenPayload);
      }

      toast.success("Aplikasi Golden Candidate berhasil diajukan!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan aplikasi Golden Candidate");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#274432]" />
      </div>
    );
  }

  if (!isProfileComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <h2 className="text-xl font-bold text-[#1A201C]">Profil Belum Lengkap</h2>
        <p className="text-sm text-[#64746A] max-w-md">
          Anda wajib melengkapi profil dasar (Data Diri, Akademik, CV) sebelum dapat mendaftar jalur Golden Candidate.
        </p>
        <Link href="/dashboard/profile">
          <Button variant="primary" className="mt-2">
            Lengkapi Profil Sekarang
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Top Header */}
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
              Formulir Golden Candidate
              <Sparkles className="w-5 h-5 text-amber-600" />
            </h1>
            <p className="text-xs text-[#64746A]">
              Jalur akselerasi riset dan penugasan proyek lab prioritas STAS-RG
            </p>
          </div>
        </div>

        {existingGoldenApp && (
          <Badge
            variant={
              existingGoldenApp.status === "ACCEPTED"
                ? "DITERIMA"
                : existingGoldenApp.status === "REJECTED"
                ? "DITOLAK"
                : "PENDING"
            }
          >
            Status Aplikasi: {existingGoldenApp.status || "TERKIRIM"}
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <GlassCard className="p-4 sm:p-6 md:p-8 flex flex-col gap-5 border-white/60">
          <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-900">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A201C]">
                Esai Motivasi & Daftar Pencapaian
              </h2>
              <p className="text-[11px] text-[#64746A]">
                Tunjukkan alasan Anda layak menjadi Golden Candidate di STAS-RG
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1A201C]">
                Motivasi Mendaftar Golden Candidate *
              </label>
              <textarea
                rows={5}
                className="w-full px-4 py-3 rounded-2xl bg-white/40 border border-black/10 focus:border-[#274432] focus:ring-1 focus:ring-[#274432] text-xs text-[#1A201C] outline-hidden placeholder:text-[#64746A]/60 transition-colors"
                placeholder="Ceritakan mengapa Anda tertarik dengan riset STAS-RG, target publikasi/proyek, dan dedikasi Anda..."
                {...register("motivasi", {
                  required: "Esai motivasi wajib diisi",
                  minLength: {
                    value: 20,
                    message: "Motivasi minimal 20 karakter",
                  },
                })}
              />
              {errors.motivasi && (
                <span className="text-[11px] text-red-600 font-medium">
                  {errors.motivasi.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1A201C]">
                Prestasi & Portofolio Relevan *
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-white/40 border border-black/10 focus:border-[#274432] focus:ring-1 focus:ring-[#274432] text-xs text-[#1A201C] outline-hidden placeholder:text-[#64746A]/60 transition-colors"
                placeholder="Tuliskan daftar karya inovatif, link repo GitHub, juara lomba, publikasi ilmiah, atau proyek teknologi..."
                {...register("pencapaian", {
                  required: "Daftar pencapaian/prestasi wajib diisi",
                  minLength: {
                    value: 10,
                    message: "Pencapaian minimal 10 karakter",
                  },
                })}
              />
              {errors.pencapaian && (
                <span className="text-[11px] text-red-600 font-medium">
                  {errors.pencapaian.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1A201C]">
                Kontak Rekomendasi Dosen / Mentor (Opsional)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-2xl bg-white/40 border border-black/10 focus:border-[#274432] focus:ring-1 focus:ring-[#274432] text-xs text-[#1A201C] outline-hidden placeholder:text-[#64746A]/60"
                placeholder="Contoh: Dr. Budi Santoso (Dosen Pembimbing - budi@univ.ac.id)"
                {...register("rekomendasi")}
              />
            </div>
          </div>
        </GlassCard>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto justify-center bg-[#274432] hover:bg-[#1e3426] shadow-xl shadow-[#274432]/20"
            isLoading={isSubmitting}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Kirim Aplikasi Golden Candidate
          </Button>
        </div>
      </form>
    </div>
  );
}

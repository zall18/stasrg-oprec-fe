"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";
import { Badge } from "@/components/ui/badge";
import {
  User,
  GraduationCap,
  FileCheck,
  Save,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle2,
  FileText,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WizardFormData {
  fullName: string;
  universitas: string;
  nim: string;
  programStudi: string;
  semester: number;
  ipk: number;
  roleInterest: "RISET" | "MAGANG";
  cvUrl: string;
  portfolioUrl: string;
  transkripUrl?: string;
  motivasi: string;
  pencapaian: string;
  rekomendasi?: string;
}

export default function GoldenCandidatePage() {
  const router = useRouter();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingGoldenApp, setExistingGoldenApp] = useState<any>(null);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [transkripFile, setTranskripFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<WizardFormData>({
    defaultValues: {
      roleInterest: "RISET",
      cvUrl: "",
      portfolioUrl: "",
      transkripUrl: "",
      motivasi: "",
      pencapaian: "",
      rekomendasi: "",
    },
  });

  const formValues = watch();

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, goldenRes] = await Promise.allSettled([
          api.getCandidateProfile(),
          api.getGoldenApplication(),
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value.data?.data) {
          const p = profileRes.value.data.data;
          setValue("fullName", p.fullName || "");
          setValue("universitas", p.universitas || "");
          setValue("nim", p.nim || "");
          setValue("programStudi", p.programStudi || "");
          setValue("roleInterest", p.roleInterest || "RISET");
          setValue("cvUrl", p.cvUrl || "");
          setValue("portfolioUrl", p.portfolioUrl || "");
          setValue("transkripUrl", p.transkripUrl || "");
          if (p.ipk) setValue("ipk", Number(p.ipk));
          if (p.semester) setValue("semester", Number(p.semester));
        }

        if (goldenRes.status === "fulfilled" && goldenRes.value.data?.data) {
          const g = goldenRes.value.data.data;
          setExistingGoldenApp(g);
          setValue("motivasi", g.motivasi || "");
          setValue("pencapaian", g.pencapaian || "");
          setValue("rekomendasi", g.rekomendasi || "");
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [setValue]);

  const validateStep = async (step: number) => {
    if (step === 1) {
      return trigger(["fullName", "universitas", "nim", "programStudi"]);
    }
    if (step === 2) {
      return trigger(["ipk", "semester", "roleInterest", "portfolioUrl"]);
    }
    if (step === 3) {
      return trigger(["motivasi", "pencapaian"]);
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) {
      toast.error("Mohon lengkapi kolom yang wajib diisi terlebih dahulu.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (values: WizardFormData) => {
    setIsSubmitting(true);
    try {
      let finalCvUrl = values.cvUrl;
      let finalTranskripUrl = values.transkripUrl;

      // Upload CV jika ada file baru
      if (cvFile) {
        toast.info("Mengunggah berkas CV...");
        const uploadRes = await api.uploadDocument(cvFile);
        finalCvUrl = uploadRes.data?.data?.url;
      }

      if (!finalCvUrl) {
        throw new Error("Berkas CV wajib diunggah untuk jalur Golden Candidate");
      }

      // Upload Transkrip jika ada file baru
      if (transkripFile) {
        toast.info("Mengunggah berkas Transkrip...");
        const uploadRes = await api.uploadDocument(transkripFile);
        finalTranskripUrl = uploadRes.data?.data?.url;
      }

      // 1. Simpan/Update Profil Kandidat
      await api.upsertCandidateProfile({
        fullName: values.fullName,
        universitas: values.universitas,
        nim: values.nim,
        programStudi: values.programStudi,
        roleInterest: values.roleInterest,
        ipk: Number(values.ipk),
        semester: Number(values.semester),
        cvUrl: finalCvUrl,
        portfolioUrl: values.portfolioUrl,
        transkripUrl: finalTranskripUrl || undefined,
      });

      // 2. Simpan Golden Application (POST atau PUT jika sudah ada)
      const goldenPayload = {
        motivasi: values.motivasi,
        pencapaian: values.pencapaian,
        rekomendasi: values.rekomendasi || undefined,
      };

      if (existingGoldenApp?.id && existingGoldenApp?.status === "PENDING") {
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

  const steps = [
    { num: 1, title: "Data Diri" },
    { num: 2, title: "Akademik & Berkas" },
    { num: 3, title: "Motivasi & Prestasi" },
    { num: 4, title: "Review & Submit" },
  ];

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
              existingGoldenApp.status === "APPROVED"
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

      {/* Stepper Header Navigation */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 p-3 rounded-2xl bg-white/40 border border-white/60 shadow-xs">
        {steps.map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => {
              if (s.num < currentStep) setCurrentStep(s.num);
            }}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold transition-all",
              currentStep === s.num
                ? "bg-[#274432] text-white shadow-xs"
                : s.num < currentStep
                ? "bg-emerald-600/15 text-emerald-800 hover:bg-emerald-600/25 cursor-pointer"
                : "text-[#64746A] opacity-60 cursor-not-allowed"
            )}
          >
            <span
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                currentStep === s.num ? "bg-white/20 text-white" : "bg-black/10"
              )}
            >
              {s.num < currentStep ? "✓" : s.num}
            </span>
            <span className="hidden sm:inline truncate">{s.title}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* STEP 1: DATA DIRI */}
        {currentStep === 1 && (
          <GlassCard className="p-6 sm:p-8 flex flex-col gap-5 border-white/60 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1A201C]">
                  Langkah 1: Informasi Data Diri
                </h2>
                <p className="text-[11px] text-[#64746A]">
                  Identitas resmi mahasiswa pendaftar
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap *"
                placeholder="Contoh: Muhammad Alif"
                error={errors.fullName?.message}
                {...register("fullName", { required: "Nama lengkap wajib diisi" })}
              />

              <Input
                label="Nomor Induk Mahasiswa (NIM) *"
                placeholder="Contoh: 102022530058"
                error={errors.nim?.message}
                {...register("nim", { required: "NIM wajib diisi" })}
              />

              <Input
                label="Asal Perguruan Tinggi / Universitas *"
                placeholder="Contoh: Universitas Indonesia"
                error={errors.universitas?.message}
                {...register("universitas", { required: "Universitas wajib diisi" })}
              />

              <Input
                label="Program Studi / Jurusan *"
                placeholder="Contoh: Teknik Komputer / Sistem Informasi"
                error={errors.programStudi?.message}
                {...register("programStudi", { required: "Program studi wajib diisi" })}
              />
            </div>
          </GlassCard>
        )}

        {/* STEP 2: AKADEMIK & DOKUMEN */}
        {currentStep === 2 && (
          <GlassCard className="p-6 sm:p-8 flex flex-col gap-5 border-white/60 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1A201C]">
                  Langkah 2: Data Akademik & Berkas Pendukung
                </h2>
                <p className="text-[11px] text-[#64746A]">
                  Indeks prestasi, minat posisi, dan dokumen portofolio
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="IPK Terakhir (Skala 4.0) *"
                type="number"
                step="0.01"
                placeholder="Contoh: 3.85"
                error={errors.ipk?.message}
                {...register("ipk", {
                  required: "IPK wajib diisi",
                  min: { value: 0, message: "IPK min 0" },
                  max: { value: 4.0, message: "IPK max 4.0" },
                })}
              />

              <Input
                label="Semester Berjalan *"
                type="number"
                placeholder="Contoh: 5"
                error={errors.semester?.message}
                {...register("semester", {
                  required: "Semester wajib diisi",
                  min: { value: 1, message: "Semester min 1" },
                  max: { value: 14, message: "Semester max 14" },
                })}
              />

              <Select
                label="Minat Posisi Riset *"
                options={[
                  { value: "RISET", label: "Mahasiswa Riset (Jangka Panjang)" },
                  { value: "MAGANG", label: "Mahasiswa Magang (Magang Industri)" },
                ]}
                error={errors.roleInterest?.message}
                {...register("roleInterest")}
              />
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <Input
                label="Tautan Portofolio / GitHub / LinkedIn *"
                placeholder="Contoh: https://github.com/username atau https://linkedin.com/in/..."
                error={errors.portfolioUrl?.message}
                {...register("portfolioUrl", {
                  required: "Tautan portofolio/GitHub wajib diisi",
                })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Dropzone
                  label="Unggah Curriculum Vitae (CV) *"
                  helperText="Format PDF (Maksimal 5MB)"
                  accept="application/pdf"
                  onFileSelect={setCvFile}
                  selectedFile={cvFile}
                  currentUrl={formValues.cvUrl}
                />

                <Dropzone
                  label="Unggah Transkrip Nilai (Opsional)"
                  helperText="Format PDF (Maksimal 5MB)"
                  accept="application/pdf"
                  onFileSelect={setTranskripFile}
                  selectedFile={transkripFile}
                  currentUrl={formValues.transkripUrl}
                />
              </div>
            </div>
          </GlassCard>
        )}

        {/* STEP 3: MOTIVASI & PRESTASI */}
        {currentStep === 3 && (
          <GlassCard className="p-6 sm:p-8 flex flex-col gap-5 border-white/60 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-900">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1A201C]">
                  Langkah 3: Esai Motivasi & Daftar Pencapaian
                </h2>
                <p className="text-[11px] text-[#64746A]">
                  Tunjukkan alasan Anda layak menjadi Golden Candidate di STAS-RG
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1A201C]">
                  Esai Motivasi & Ketertarikan Riset * (Min. 50 Karakter)
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-white/40 border border-black/10 focus:border-[#274432] focus:ring-1 focus:ring-[#274432] text-xs text-[#1A201C] outline-hidden placeholder:text-[#64746A]/60"
                  placeholder="Ceritakan mengapa Anda tertarik dengan riset STAS-RG, topik apa yang ingin Anda eksplorasi, serta komitmen waktu Anda..."
                  {...register("motivasi", {
                    required: "Esai motivasi wajib diisi",
                    minLength: {
                      value: 50,
                      message: "Esai motivasi minimal 50 karakter",
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
                  Daftar Prestasi / Proyek Unggulan *
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-white/40 border border-black/10 focus:border-[#274432] focus:ring-1 focus:ring-[#274432] text-xs text-[#1A201C] outline-hidden placeholder:text-[#64746A]/60"
                  placeholder="Misal: Juara 1 Hackathon Nasional 2025, Publikasi IEEE / Scopus, Asisten Laboratorium, atau Proyek AI Edge..."
                  {...register("pencapaian", {
                    required: "Daftar prestasi/proyek unggulan wajib diisi",
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
        )}

        {/* STEP 4: REVIEW & SUBMIT */}
        {currentStep === 4 && (
          <GlassCard className="p-6 sm:p-8 flex flex-col gap-6 border-white/60 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-700/10 flex items-center justify-center text-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1A201C]">
                  Langkah 4: Ringkasan & Konfirmasi Pendaftaran
                </h2>
                <p className="text-[11px] text-[#64746A]">
                  Periksa kembali seluruh isian sebelum mengirim aplikasi ke panitia seleksi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/50 border border-black/5 flex flex-col gap-1">
                <span className="text-[#64746A]">Nama Lengkap</span>
                <span className="font-bold text-[#1A201C]">{formValues.fullName || "-"}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/50 border border-black/5 flex flex-col gap-1">
                <span className="text-[#64746A]">NIM & Universitas</span>
                <span className="font-bold text-[#1A201C]">
                  {formValues.nim} - {formValues.universitas}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/50 border border-black/5 flex flex-col gap-1">
                <span className="text-[#64746A]">Program Studi & Semester</span>
                <span className="font-bold text-[#1A201C]">
                  {formValues.programStudi} (Sem. {formValues.semester})
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/50 border border-black/5 flex flex-col gap-1">
                <span className="text-[#64746A]">IPK & Minat Posisi</span>
                <span className="font-bold text-[#1A201C]">
                  IPK {formValues.ipk} • {formValues.roleInterest}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/50 border border-black/5 flex flex-col gap-2 text-xs">
              <span className="text-[#64746A] font-semibold">Esai Motivasi:</span>
              <p className="text-[#1A201C] italic leading-relaxed">
                "{formValues.motivasi || "Belum diisi"}"
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/50 border border-black/5 flex flex-col gap-2 text-xs">
              <span className="text-[#64746A] font-semibold">Pencapaian & Proyek:</span>
              <p className="text-[#1A201C] leading-relaxed">
                {formValues.pencapaian || "Belum diisi"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/70 text-xs text-amber-900 leading-relaxed">
              Dengan mengklik <strong>Kirim Aplikasi Golden Candidate</strong>, Anda
              menyatakan bahwa seluruh data yang diisikan adalah benar dan siap
              mengikuti tahapan seleksi wawancara langsung bersama lead researcher STAS-RG.
            </div>
          </GlassCard>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Sebelumnya
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Lanjut ke Langkah {currentStep + 1}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="bg-[#274432] hover:bg-[#1e3426] shadow-xl shadow-[#274432]/20"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Kirim Aplikasi Golden Candidate
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

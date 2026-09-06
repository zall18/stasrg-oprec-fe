"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  candidateProfileSchema,
  CandidateProfileInput,
} from "@/lib/schemas/candidate.schema";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";
import {
  User,
  GraduationCap,
  FileCheck,
  Save,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function GoldenCandidatePage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [transkripFile, setTranskripFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CandidateProfileInput>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: {
      roleInterest: "RISET",
      cvUrl: "",
      portfolioUrl: "",
      transkripUrl: "",
    },
  });

  const currentCvUrl = watch("cvUrl");
  const currentTranskripUrl = watch("transkripUrl");

  useEffect(() => {
    api
      .getCandidateProfile()
      .then((res) => {
        const data = res.data?.data;
        if (data) {
          setValue("fullName", data.fullName || "");
          setValue("universitas", data.universitas || "");
          setValue("nim", data.nim || "");
          setValue("programStudi", data.programStudi || "");
          setValue("roleInterest", data.roleInterest || "RISET");
          setValue("cvUrl", data.cvUrl || "");
          setValue("portfolioUrl", data.portfolioUrl || "");
          setValue("transkripUrl", data.transkripUrl || "");
          if (data.ipk) setValue("ipk", Number(data.ipk));
          if (data.semester) setValue("semester", Number(data.semester));
          if (data.pengalaman) setValue("pengalaman", data.pengalaman);
        }
      })
      .catch(() => {
        // Profil baru belum ada di DB
      })
      .finally(() => setIsLoadingProfile(false));
  }, [setValue]);

  const onSubmit = async (values: CandidateProfileInput) => {
    setIsSubmitting(true);
    try {
      let finalCvUrl = values.cvUrl;
      let finalTranskripUrl = values.transkripUrl;

      // Upload CV jika user memilih file baru
      if (cvFile) {
        toast.info("Mengunggah berkas CV...");
        const uploadRes = await api.uploadDocument(cvFile);
        finalCvUrl = uploadRes.data?.data?.url;
        if (!finalCvUrl) throw new Error("Gagal mendapatkan URL unggahan CV");
      }

      if (!finalCvUrl) {
        throw new Error("Berkas CV wajib diunggah");
      }

      // Upload Transkrip jika ada file baru
      if (transkripFile) {
        toast.info("Mengunggah berkas Transkrip...");
        const uploadRes = await api.uploadDocument(transkripFile);
        finalTranskripUrl = uploadRes.data?.data?.url;
      }

      const payload = {
        ...values,
        cvUrl: finalCvUrl,
        transkripUrl: finalTranskripUrl || undefined,
      };

      await api.upsertCandidateProfile(payload);
      toast.success("Profil Golden Candidate berhasil disimpan!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan data profil kandidat");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Formulir Golden Candidate
              <Sparkles className="w-5 h-5 text-amber-600" />
            </h1>
            <p className="text-xs text-[#64746A]">
              Lengkapi informasi pribadi, akademik, serta dokumen portofolio & CV.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Section 1: Data Pribadi */}
        <GlassCard className="p-6 sm:p-8 flex flex-col gap-5 border-white/60">
          <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
            <div className="w-8 h-8 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#1A201C]">
              1. Informasi Pribadi
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap"
              placeholder="Contoh: Muhammad Alif"
              error={errors.fullName?.message}
              {...register("fullName")}
            />

            <Input
              label="Nomor Induk Mahasiswa (NIM)"
              placeholder="Contoh: 102022530058"
              error={errors.nim?.message}
              {...register("nim")}
            />
          </div>
        </GlassCard>

        {/* Section 2: Akademik & Minat Riset */}
        <GlassCard className="p-6 sm:p-8 flex flex-col gap-5 border-white/60">
          <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
            <div className="w-8 h-8 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#1A201C]">
              2. Informasi Akademik & Peminatan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Perguruan Tinggi / Universitas"
              placeholder="Nama Universitas Anda"
              error={errors.universitas?.message}
              {...register("universitas")}
            />

            <Input
              label="Program Studi / Jurusan"
              placeholder="Teknik Informatika, Sistem Informasi, dsb"
              error={errors.programStudi?.message}
              {...register("programStudi")}
            />

            <Select
              label="Pilihan Peran (Role Interest)"
              options={[
                { label: "Mahasiswa Riset (Kajian Ilmiah & Penelitian)", value: "RISET" },
                { label: "Mahasiswa Magang (Pengembangan Produk & IoT)", value: "MAGANG" },
              ]}
              error={errors.roleInterest?.message}
              {...register("roleInterest")}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="IPK Terakhir"
                type="number"
                step="0.01"
                placeholder="3.75"
                error={errors.ipk?.message}
                {...register("ipk", { valueAsNumber: true })}
              />
              <Input
                label="Semester Berjalan"
                type="number"
                placeholder="6"
                error={errors.semester?.message}
                {...register("semester", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#274432]/80 ml-2">
              Pengalaman Terkait / Ringkasan Diri (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan ringkasan pengalaman riset, organisasi, atau proyek teknologi..."
              className="w-full bg-[#F5F7EC]/60 focus:bg-[#F5F7EC]/90 border border-black/5 focus:border-[#274432]/40 rounded-2xl p-4 text-sm text-[#1A201C] outline-none transition-all duration-200 backdrop-blur-sm placeholder:text-[#64746A]/70 shadow-inner"
              {...register("pengalaman")}
            />
          </div>
        </GlassCard>

        {/* Section 3: Dokumen & Portofolio */}
        <GlassCard className="p-6 sm:p-8 flex flex-col gap-5 border-white/60">
          <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
            <div className="w-8 h-8 rounded-xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
              <FileCheck className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#1A201C]">
              3. Berkas & Tautan Portofolio
            </h2>
          </div>

          <Input
            label="Tautan Portofolio / GitHub / LinkedIn (URL Valid)"
            placeholder="https://github.com/username atau https://linkedin.com/in/..."
            error={errors.portfolioUrl?.message}
            {...register("portfolioUrl")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <Dropzone
              label="Kurikulum Vitae (CV) *"
              helperText="Wajib format PDF, maksimal 5MB"
              currentUrl={currentCvUrl}
              onFileSelect={(file) => {
                setCvFile(file);
                if (file) {
                  // Isi placeholder agar lolos validasi URL awal Zod
                  setValue("cvUrl", "https://uploading-pending.pdf");
                }
              }}
              error={errors.cvUrl?.message}
            />

            <Dropzone
              label="Transkrip Nilai Akademik (Opsional)"
              helperText="Format PDF, maksimal 5MB"
              currentUrl={currentTranskripUrl}
              onFileSelect={(file) => setTranskripFile(file)}
              error={errors.transkripUrl?.message}
            />
          </div>
        </GlassCard>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/dashboard">
            <Button variant="secondary" type="button">
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Simpan Profil Golden Candidate
          </Button>
        </div>
      </form>
    </div>
  );
}

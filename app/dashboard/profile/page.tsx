"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
  Save,
  Loader2,
} from "lucide-react";

interface ProfileFormData {
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
  pengalaman?: string;
}

export default function CandidateProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [transkripFile, setTranskripFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      roleInterest: "RISET",
      cvUrl: "",
      portfolioUrl: "",
      transkripUrl: "",
      pengalaman: "",
    },
  });

  const formValues = watch();

  useEffect(() => {
    async function loadData() {
      try {
        const profileRes = await api.getCandidateProfile();
        if (profileRes.data?.data) {
          const p = profileRes.data.data;
          setValue("fullName", p.fullName || "");
          setValue("universitas", p.universitas || "");
          setValue("nim", p.nim || "");
          setValue("programStudi", p.programStudi || "");
          setValue("roleInterest", p.roleInterest || "RISET");
          setValue("cvUrl", p.cvUrl || "");
          setValue("portfolioUrl", p.portfolioUrl || "");
          setValue("transkripUrl", p.transkripUrl || "");
          setValue("pengalaman", p.pengalaman || "");
          if (p.ipk) setValue("ipk", Number(p.ipk));
          if (p.semester) setValue("semester", Number(p.semester));
        }
      } catch (err) {
        // user might not have profile yet
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [setValue]);

  const onSubmit = async (values: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      let finalCvUrl = values.cvUrl;
      let finalTranskripUrl = values.transkripUrl;

      if (cvFile) {
        toast.info("Mengunggah berkas CV...");
        const uploadRes = await api.uploadDocument(cvFile);
        finalCvUrl = uploadRes.data?.data?.url;
      }

      if (!finalCvUrl) {
        throw new Error("Berkas CV wajib diunggah.");
      }

      if (transkripFile) {
        toast.info("Mengunggah berkas Transkrip...");
        const uploadRes = await api.uploadDocument(transkripFile);
        finalTranskripUrl = uploadRes.data?.data?.url;
      }

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
        pengalaman: values.pengalaman,
      });

      toast.success("Profil berhasil disimpan!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan profil");
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

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1A201C] flex items-center gap-2">
          <User className="w-6 h-6 text-[#274432]" />
          Profil Kandidat
        </h1>
        <p className="text-xs text-[#64746A]">
          Lengkapi data diri dan portofolio Anda sebagai syarat wajib sebelum mendaftar program apapun.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <GlassCard className="p-6 sm:p-8 flex flex-col gap-5 border-white/60">
          <h2 className="text-sm font-bold text-[#1A201C] border-b border-black/5 pb-3">
            Informasi Data Diri
          </h2>
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
              placeholder="Contoh: Teknik Komputer"
              error={errors.programStudi?.message}
              {...register("programStudi", { required: "Program studi wajib diisi" })}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-6 sm:p-8 flex flex-col gap-5 border-white/60">
          <div className="flex items-center gap-2 border-b border-black/5 pb-3">
            <GraduationCap className="w-4 h-4 text-[#274432]" />
            <h2 className="text-sm font-bold text-[#1A201C]">
              Akademik & Berkas Pendukung
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="IPK Terakhir *"
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
              label="Minat Posisi *"
              options={[
                { value: "RISET", label: "Mahasiswa Riset" },
                { value: "MAGANG", label: "Mahasiswa Magang" },
              ]}
              error={errors.roleInterest?.message}
              {...register("roleInterest")}
            />
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <Input
              label="Tautan Portofolio / GitHub *"
              placeholder="Contoh: https://github.com/..."
              error={errors.portfolioUrl?.message}
              {...register("portfolioUrl", {
                required: "Tautan portofolio/GitHub wajib diisi",
              })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Dropzone
                label="Unggah CV *"
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

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="bg-[#274432] hover:bg-[#1e3426] shadow-xl shadow-[#274432]/20 px-8"
            isLoading={isSubmitting}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Simpan Profil
          </Button>
        </div>
      </form>
    </div>
  );
}

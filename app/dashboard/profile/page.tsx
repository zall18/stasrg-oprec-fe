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
  FileText,
  AlertCircle,
  CheckCircle2,
  Info,
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
  transkripUrl: string;
  ksmUrl: string;
  eprtUrl: string;
  linkedinUrl: string;
  pengalaman?: string;
}

export default function CandidateProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // File states
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [transkripFile, setTranskripFile] = useState<File | null>(null);
  const [ksmFile, setKsmFile] = useState<File | null>(null);
  const [eprtFile, setEprtFile] = useState<File | null>(null);

  // File error states
  const [fileErrors, setFileErrors] = useState<{
    cv?: string;
    transkrip?: string;
    ksm?: string;
    eprt?: string;
  }>({});

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
      ksmUrl: "",
      eprtUrl: "",
      linkedinUrl: "",
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
          setValue("ksmUrl", p.ksmUrl || "");
          setValue("eprtUrl", p.eprtUrl || "");
          setValue("linkedinUrl", p.linkedinUrl || "");
          setValue("pengalaman", p.pengalaman || "");
          if (p.ipk) setValue("ipk", Number(p.ipk));
          if (p.semester) setValue("semester", Number(p.semester));
        }
      } catch {
        // user might not have profile yet
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [setValue]);

  const onSubmit = async (values: ProfileFormData) => {
    setFileErrors({});

    // Validate mandatory files
    const newErrors: typeof fileErrors = {};
    if (!cvFile && !values.cvUrl) {
      newErrors.cv = "Berkas CV wajib diunggah.";
    }
    if (!transkripFile && !values.transkripUrl) {
      newErrors.transkrip = "Berkas Transkrip Nilai wajib diunggah.";
    }
    if (!ksmFile && !values.ksmUrl) {
      newErrors.ksm = "Berkas Kartu Studi Mahasiswa (KSM) wajib diunggah.";
    }
    if (!eprtFile && !values.eprtUrl) {
      newErrors.eprt = "Berkas Sertifikat EPRT / Bahasa Inggris wajib diunggah.";
    }

    if (Object.keys(newErrors).length > 0) {
      setFileErrors(newErrors);
      toast.error("Mohon lengkapi seluruh berkas dokumen wajib di bawah.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalCvUrl = values.cvUrl;
      let finalTranskripUrl = values.transkripUrl;
      let finalKsmUrl = values.ksmUrl;
      let finalEprtUrl = values.eprtUrl;

      // 1. Upload CV if selected
      if (cvFile) {
        toast.info("Mengunggah berkas CV...");
        const res = await api.uploadDocument(cvFile);
        finalCvUrl = res.data?.data?.url;
      }

      // 2. Upload Transkrip if selected
      if (transkripFile) {
        toast.info("Mengunggah berkas Transkrip Nilai...");
        const res = await api.uploadDocument(transkripFile);
        finalTranskripUrl = res.data?.data?.url;
      }

      // 3. Upload KSM if selected
      if (ksmFile) {
        toast.info("Mengunggah berkas KSM...");
        const res = await api.uploadDocument(ksmFile);
        finalKsmUrl = res.data?.data?.url;
      }

      // 4. Upload EPRT if selected
      if (eprtFile) {
        toast.info("Mengunggah sertifikat EPRT...");
        const res = await api.uploadDocument(eprtFile);
        finalEprtUrl = res.data?.data?.url;
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
        transkripUrl: finalTranskripUrl,
        ksmUrl: finalKsmUrl,
        eprtUrl: finalEprtUrl,
        linkedinUrl: values.linkedinUrl,
        pengalaman: values.pengalaman,
      });

      toast.success("Profil dan berkas pendaftaran berhasil disimpan!");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.message || "Gagal menyimpan profil";
      if (msg.toLowerCase().includes("nim") || msg.toLowerCase().includes("unique")) {
        toast.error("NIM tersebut telah digunakan oleh akun lain. Pastikan memasukkan NIM Anda yang valid.");
      } else {
        toast.error(msg);
      }
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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1A201C] flex items-center gap-2">
          <User className="w-6 h-6 text-[#274432]" />
          Profil & Kelengkapan Berkas Kandidat
        </h1>
        <p className="text-xs text-[#64746A]">
          Lengkapi data identitas, akademik, dan dokumen wajib sebagai persyaratan utama sebelum mendaftar ke batch Oprec atau jalur Golden Ticket.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* SECTION 1: DATA IDENTITAS DIRI */}
        <GlassCard className="p-4 sm:p-6 md:p-8 flex flex-col gap-5 border-white/60">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h2 className="text-sm font-bold text-[#1A201C] flex items-center gap-2">
              <User className="w-4 h-4 text-[#274432]" />
              Informasi Data Diri & Identitas
            </h2>
            <span className="text-[11px] text-[#64746A] italic">* Wajib diisi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap *"
              placeholder="Contoh: Muhammad Alif Akbar"
              error={errors.fullName?.message}
              {...register("fullName", { required: "Nama lengkap wajib diisi" })}
            />

            <div>
              <Input
                label="Nomor Induk Mahasiswa (NIM) *"
                placeholder="Contoh: 1301210001"
                error={errors.nim?.message}
                {...register("nim", {
                  required: "NIM wajib diisi",
                  minLength: { value: 4, message: "NIM minimal 4 karakter" },
                })}
              />
              <p className="text-[11px] text-[#64746A] mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-[#274432] shrink-0" />
                1 akun kandidat hanya dapat menggunakan 1 NIM unik.
              </p>
            </div>

            <Input
              label="Asal Perguruan Tinggi / Universitas *"
              placeholder="Contoh: Telkom University"
              error={errors.universitas?.message}
              {...register("universitas", { required: "Universitas wajib diisi" })}
            />

            <Input
              label="Program Studi / Jurusan *"
              placeholder="Contoh: S1 Teknik Informatika"
              error={errors.programStudi?.message}
              {...register("programStudi", { required: "Program studi wajib diisi" })}
            />
          </div>
        </GlassCard>

        {/* SECTION 2: AKADEMIK & TAUTAN */}
        <GlassCard className="p-4 sm:p-6 md:p-8 flex flex-col gap-5 border-white/60">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h2 className="text-sm font-bold text-[#1A201C] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#274432]" />
              Akademik & Profil Daring (Online)
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
              label="Minat Posisi / Role *"
              options={[
                { value: "RISET", label: "Mahasiswa Riset" },
                { value: "MAGANG", label: "Mahasiswa Magang" },
              ]}
              error={errors.roleInterest?.message}
              {...register("roleInterest")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Tautan Profil LinkedIn *"
              placeholder="Contoh: https://linkedin.com/in/username"
              error={errors.linkedinUrl?.message}
              {...register("linkedinUrl", {
                required: "Tautan profil LinkedIn wajib diisi",
              })}
            />

            <Input
              label="Tautan Portofolio / GitHub *"
              placeholder="Contoh: https://github.com/username atau https://myportfolio.com"
              error={errors.portfolioUrl?.message}
              {...register("portfolioUrl", {
                required: "Tautan portofolio/GitHub wajib diisi",
              })}
            />
          </div>
        </GlassCard>

        {/* SECTION 3: UNGGAH DOKUMEN WAJIB (CV, TRANSKRIP, KSM, EPRT) */}
        <GlassCard className="p-4 sm:p-6 md:p-8 flex flex-col gap-5 border-white/60">
          <div className="flex flex-col gap-1 border-b border-black/5 pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1A201C] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#274432]" />
                Unggah Berkas & Dokumen Wajib
              </h2>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Semua berkas berformat PDF (Maks. 5MB)
              </span>
            </div>
            <p className="text-xs text-[#64746A]">
              Pastikan dokumen yang diunggah terbaca dengan jelas untuk mempermudah proses seleksi berkas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. CV */}
            <div className="flex flex-col gap-1">
              <Dropzone
                label="1. Berkas Curriculum Vitae (CV) *"
                helperText="Format PDF (Maksimal 5MB)"
                accept="application/pdf"
                onFileSelect={(file) => {
                  setCvFile(file);
                  if (file) setFileErrors((prev) => ({ ...prev, cv: undefined }));
                }}
                selectedFile={cvFile}
                currentUrl={formValues.cvUrl}
                error={fileErrors.cv}
              />
            </div>

            {/* 2. Transkrip Nilai (WAJIB) */}
            <div className="flex flex-col gap-1">
              <Dropzone
                label="2. Transkrip Nilai Terbaru *"
                helperText="Format PDF (Maksimal 5MB) - Wajib"
                accept="application/pdf"
                onFileSelect={(file) => {
                  setTranskripFile(file);
                  if (file) setFileErrors((prev) => ({ ...prev, transkrip: undefined }));
                }}
                selectedFile={transkripFile}
                currentUrl={formValues.transkripUrl}
                error={fileErrors.transkrip}
              />
            </div>

            {/* 3. Kartu Studi Mahasiswa (KSM) (WAJIB) */}
            <div className="flex flex-col gap-1">
              <Dropzone
                label="3. Kartu Studi Mahasiswa (KSM) *"
                helperText="Format PDF (Maksimal 5MB) - Bukti mahasiswa aktif"
                accept="application/pdf"
                onFileSelect={(file) => {
                  setKsmFile(file);
                  if (file) setFileErrors((prev) => ({ ...prev, ksm: undefined }));
                }}
                selectedFile={ksmFile}
                currentUrl={formValues.ksmUrl}
                error={fileErrors.ksm}
              />
            </div>

            {/* 4. Sertifikat EPRT / Bahasa Inggris (WAJIB) */}
            <div className="flex flex-col gap-1">
              <Dropzone
                label="4. Sertifikat EPRT / Bahasa Inggris *"
                helperText="Format PDF (Maksimal 5MB) - Skor EPRT / TOEFL / IELTS"
                accept="application/pdf"
                onFileSelect={(file) => {
                  setEprtFile(file);
                  if (file) setFileErrors((prev) => ({ ...prev, eprt: undefined }));
                }}
                selectedFile={eprtFile}
                currentUrl={formValues.eprtUrl}
                error={fileErrors.eprt}
              />
            </div>
          </div>
        </GlassCard>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto justify-center bg-[#274432] hover:bg-[#1e3426] shadow-xl shadow-[#274432]/20 px-8"
            isLoading={isSubmitting}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Simpan & Perbarui Profil
          </Button>
        </div>
      </form>
    </div>
  );
}

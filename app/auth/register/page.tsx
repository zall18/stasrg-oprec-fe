"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/schemas/auth.schema";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth.store";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Mail, Lock, ArrowRight, UserCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "CANDIDATE",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      const { user, token } = res.data?.data || {};

      if (!token || !user) {
        throw new Error("Pendaftaran berhasil, tetapi sesi tidak diterima.");
      }

      setAuth(user, token);
      toast.success("Akun berhasil dibuat!");

      if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat akun. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-white/50 backdrop-blur-xl bg-white/30">
        {/* Left: Form Area */}
        <div className="p-8 sm:p-12 flex flex-col justify-between bg-white/40 backdrop-blur-md">
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-block">
              <Logo size="sm" />
            </Link>

            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A201C]">
                Registrasi Akun
              </h1>
              <p className="text-xs text-[#64746A]">
                Buat akun untuk mengajukan berkas Golden Candidate atau Oprec.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Email Institusi / Pribadi"
                type="email"
                placeholder="nama@email.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Kata Sandi"
                type="password"
                placeholder="Minimal 6 karakter"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register("password")}
              />

              <Select
                label="Tipe Akun (Role)"
                options={[
                  { label: "Kandidat (Mahasiswa Pendaftar)", value: "CANDIDATE" },
                  { label: "Admin / PIC Seleksi Lab", value: "ADMIN" },
                ]}
                {...register("role")}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Daftar Sekarang
                </Button>
              </div>
            </form>
          </div>

          <div className="pt-8 text-center text-xs text-[#64746A]">
            Sudah memiliki akun terdaftar?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-[#274432] hover:underline"
            >
              Masuk Di Sini
            </Link>
          </div>
        </div>

        {/* Right: Graphic & Info Panel */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-[#274432] to-[#1F3628] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />

          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300">
              Pendaftaran Resmi
            </span>
          </div>

          <div className="flex flex-col gap-4 z-10">
            <h2 className="text-3xl font-extrabold leading-snug">
              Jadilah Bagian dari Inovasi Riset
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              Daftarkan profil akademik, lampirkan bukti karya portofolio Anda, dan
              dapatkan kesempatan magang atau riset di STAS-RG.
            </p>
          </div>

          <div className="pt-4 border-t border-white/15 text-[11px] text-white/60">
            STAS-RG • Data Pribadi Dijamin Kerahasiaannya
          </div>
        </div>
      </div>
    </div>
  );
}

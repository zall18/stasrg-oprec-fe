"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/schemas/auth.schema";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth.store";
import { useToast } from "@/components/ui/toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [isLoading, setIsLoading] = useState(false);
  const [unconfirmedMessage, setUnconfirmedMessage] = useState<string | null>(null);

  const isConfirmed = searchParams.get("confirmed") === "true";
  const emailParam = searchParams.get("email");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailParam || "",
      password: "",
    },
  });

  useEffect(() => {
    if (emailParam) {
      setValue("email", emailParam);
    }
  }, [emailParam, setValue]);

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setUnconfirmedMessage(null);
    try {
      const res = await api.login(data);
      const { user, token } = res.data?.data || {};

      if (!token || !user) {
        throw new Error("Respons login tidak valid dari server");
      }

      setAuth(user, token);
      toast.success(`Selamat datang, ${user.email}!`);

      if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg = err.message || "Gagal masuk. Periksa email dan password Anda.";
      if (
        msg.toLowerCase().includes("belum dikonfirmasi") ||
        msg.toLowerCase().includes("dinonaktifkan")
      ) {
        setUnconfirmedMessage(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3.5 sm:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/50 backdrop-blur-xl bg-white/30">
        {/* Left: Form Area */}
        <div className="p-5 sm:p-8 md:p-12 flex flex-col justify-between bg-white/40 backdrop-blur-md">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-block">
                <Logo size="sm" />
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Kembali
                </Button>
              </Link>
            </div>

            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A201C]">
                Masuk ke Portal
              </h1>
              <p className="text-xs text-[#64746A]">
                Gunakan email akun terdaftar Anda untuk melanjutkan.
              </p>
            </div>

            {/* Notification Banner: Akun Baru Berhasil Dikonfirmasi */}
            {isConfirmed && (
              <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200/80 flex items-start gap-3 animate-in fade-in duration-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-emerald-900">
                    Aktivasi Administrator Berhasil!
                  </span>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Akun Anda telah aktif dan siap digunakan. Silakan masukkan password yang tertera pada email undangan Anda.
                  </p>
                </div>
              </div>
            )}

            {/* Warning Banner: Akun Belum Dikonfirmasi */}
            {unconfirmedMessage && (
              <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3 animate-in fade-in duration-300">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-amber-900">
                    Akun Menunggu Aktivasi
                  </span>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {unconfirmedMessage}
                  </p>
                  <p className="text-[10px] text-amber-700/80 mt-1">
                    Silakan buka email undangan Anda dan klik tombol <strong>Konfirmasi & Aktifkan Akun Admin</strong>.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Email"
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

              <div className="flex items-center justify-end -mt-1">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold text-[#274432] hover:underline"
                >
                  Lupa Kata Sandi?
                </Link>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Masuk Sekarang
                </Button>
              </div>
            </form>
          </div>

          <div className="pt-8 text-center text-xs text-[#64746A]">
            Belum memiliki akun?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-[#274432] hover:underline"
            >
              Daftar Baru Di Sini
            </Link>
          </div>
        </div>

        {/* Right: Graphic & Info Panel */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-[#274432] to-[#1F3628] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300">
              Sistem Terverifikasi
            </span>
          </div>

          <div className="flex flex-col gap-4 z-10">
            <h2 className="text-3xl font-extrabold leading-snug">
              Smart Transportation & Autonomous Systems
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              Bergabunglah dalam riset berstandar internasional bersama dosen dan
              peneliti terkemuka dalam rekayasa sistem transportasi pintar.
            </p>
          </div>

          <div className="pt-4 border-t border-white/15 text-[11px] text-white/60">
            © {new Date().getFullYear()} STAS-RG Lab. Akses Terenkripsi.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#274432]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

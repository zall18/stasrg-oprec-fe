"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/schemas/auth.schema";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth.store";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      role: "CANDIDATE",
      otp: "",
    },
  });

  // Cooldown countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    const email = getValues("email");
    if (!email || !email.includes("@")) {
      toast.error("Masukkan alamat email yang valid terlebih dahulu.");
      return;
    }

    setIsSendingOtp(true);
    try {
      await api.sendOtp({ email: email.trim(), purpose: "REGISTRATION" });
      setIsOtpSent(true);
      setOtpCooldown(60);
      toast.success("Kode OTP verifikasi telah dikirim ke email Anda!");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirimkan kode OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await api.register({
        email: data.email.trim(),
        password: data.password,
        otp: data.otp.trim(),
        role: "CANDIDATE",
      });
      const { user, token } = res.data?.data || {};

      if (!token || !user) {
        throw new Error("Pendaftaran berhasil, tetapi sesi tidak diterima.");
      }

      setAuth(user, token);
      toast.success("Akun berhasil dibuat dan diverifikasi!");

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
                Registrasi Akun
              </h1>
              <p className="text-xs text-[#64746A]">
                Daftar akun kandidat resmi STAS-RG dengan verifikasi email aktif.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {/* Email Field with Send OTP Button */}
              <div className="flex flex-col gap-1">
                <Input
                  label="Email Institusi / Pribadi"
                  type="email"
                  placeholder="nama@email.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              {/* OTP Input Field with Cooldown Resend */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1A201C] flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-[#274432]" />
                    <span>Kode Verifikasi OTP *</span>
                  </label>
                  <button
                    type="button"
                    disabled={isSendingOtp || otpCooldown > 0}
                    onClick={handleSendOtp}
                    className={cn(
                      "text-xs font-semibold transition-colors cursor-pointer",
                      otpCooldown > 0
                        ? "text-[#64746A] cursor-not-allowed"
                        : "text-[#274432] hover:underline"
                    )}
                  >
                    {isSendingOtp
                      ? "Mengirim..."
                      : otpCooldown > 0
                      ? `Kirim ulang (${otpCooldown}s)`
                      : isOtpSent
                      ? "Kirim Ulang OTP"
                      : "Kirim Kode OTP"}
                  </button>
                </div>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Masukkan 6 digit kode OTP"
                  leftIcon={<KeyRound className="w-4 h-4" />}
                  error={errors.otp?.message}
                  {...register("otp")}
                  className="tracking-widest font-mono text-sm"
                />
                {isOtpSent && (
                  <p className="text-[11px] text-emerald-800 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>
                      Kode 6 digit telah dikirim ke email. Berlaku selama 5 menit.
                    </span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <Input
                label="Kata Sandi"
                type="password"
                placeholder="Minimal 6 karakter"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register("password")}
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
              Pendaftaran Resmi STAS-RG
            </span>
          </div>

          <div className="flex flex-col gap-4 z-10">
            <h2 className="text-3xl font-extrabold leading-snug">
              Smart Transportation & Autonomous Systems
            </h2>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Bergabunglah dengan laboratorium riset kendaraan otonom dan sistem transportasi cerdas. Buka peluang riset masa depan dan portofolio profesional Anda bersama kami.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-200 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Verifikasi kode OTP memastikan keamanan data dan keabsahan akun Anda.</span>
            </div>
          </div>

          <div className="text-[11px] text-emerald-200/60 z-10">
            &copy; {new Date().getFullYear()} STAS-RG. Hak Cipta Dilindungi.
          </div>
        </div>
      </div>
    </div>
  );
}

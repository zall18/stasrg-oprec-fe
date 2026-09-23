"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/lib/schemas/auth.schema";
import { api } from "@/lib/api/client";
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
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [targetEmail, setTargetEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Form Step 1: Request OTP
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Form Step 2: Reset Password with OTP
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    setValue: setResetValue,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema) as any,
  });

  // Cooldown countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Submit email to request OTP
  const onRequestOtp = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      await api.forgotPassword({ email: data.email.trim() });
      setTargetEmail(data.email.trim());
      setResetValue("email", data.email.trim());
      setCooldown(60);
      setStep(2);
      toast.success("Kode OTP pemulihan telah dikirim ke email Anda!");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirimkan kode pemulihan");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Resend OTP
  const onResendOtp = async () => {
    if (!targetEmail || cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await api.forgotPassword({ email: targetEmail });
      setCooldown(60);
      toast.success("Kode OTP baru berhasil dikirim ke email Anda!");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim ulang kode OTP");
    } finally {
      setIsResending(false);
    }
  };

  // Step 2: Submit new password
  const onResetPassword = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    try {
      await api.resetPassword({
        email: targetEmail,
        otp: data.otp.trim(),
        newPassword: data.newPassword,
      });
      toast.success(
        "Kata sandi berhasil diatur ulang! Silakan masuk dengan kata sandi baru."
      );
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(
        err.message || "Gagal mengatur ulang kata sandi. Pastikan OTP valid."
      );
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
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Ke Halaman Masuk
                </Button>
              </Link>
            </div>

            {step === 1 ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A201C]">
                    Lupa Kata Sandi
                  </h1>
                  <p className="text-xs text-[#64746A]">
                    Masukkan alamat email akun terdaftar Anda. Kami akan mengirimkan 6-digit kode OTP untuk mereset kata sandi.
                  </p>
                </div>

                <form onSubmit={handleSubmitEmail(onRequestOtp)} className="flex flex-col gap-4">
                  <Input
                    label="Email Akun"
                    type="email"
                    placeholder="nama@email.com"
                    leftIcon={<Mail className="w-4 h-4" />}
                    error={emailErrors.email?.message}
                    {...registerEmail("email")}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      isLoading={isLoading}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Kirim Kode Pemulihan
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A201C]">
                      Setel Kata Sandi
                    </h1>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-[#274432] font-semibold hover:underline"
                    >
                      Ubah Email
                    </button>
                  </div>
                  <p className="text-xs text-[#64746A]">
                    Kode 6 digit telah dikirim ke <strong>{targetEmail}</strong>. Masukkan kode tersebut dan buat kata sandi baru Anda.
                  </p>
                </div>

                <form onSubmit={handleSubmitReset(onResetPassword)} className="flex flex-col gap-4">
                  {/* OTP Input with Resend Action */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#1A201C] flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5 text-[#274432]" />
                        <span>Kode OTP 6 Digit *</span>
                      </label>
                      <button
                        type="button"
                        disabled={cooldown > 0 || isResending}
                        onClick={onResendOtp}
                        className={cn(
                          "text-xs font-semibold transition-colors cursor-pointer",
                          cooldown > 0
                            ? "text-[#64746A] cursor-not-allowed"
                            : "text-[#274432] hover:underline"
                        )}
                      >
                        {isResending
                          ? "Mengirim..."
                          : cooldown > 0
                          ? `Kirim ulang (${cooldown}s)`
                          : "Kirim Ulang Kode"}
                      </button>
                    </div>
                    <Input
                      type="text"
                      maxLength={6}
                      placeholder="Masukkan 6 digit angka"
                      leftIcon={<KeyRound className="w-4 h-4" />}
                      error={resetErrors.otp?.message}
                      {...registerReset("otp")}
                      className="tracking-widest font-mono text-sm"
                    />
                  </div>

                  {/* New Password */}
                  <Input
                    label="Kata Sandi Baru"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    leftIcon={<Lock className="w-4 h-4" />}
                    error={resetErrors.newPassword?.message}
                    {...registerReset("newPassword")}
                  />

                  {/* Confirm New Password */}
                  <Input
                    label="Konfirmasi Kata Sandi Baru"
                    type="password"
                    placeholder="Ketik ulang kata sandi baru"
                    leftIcon={<Lock className="w-4 h-4" />}
                    error={resetErrors.confirmPassword?.message}
                    {...registerReset("confirmPassword")}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      isLoading={isLoading}
                      rightIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Simpan Kata Sandi Baru
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>

          <div className="pt-8 text-center text-xs text-[#64746A]">
            Ingat kata sandi Anda?{" "}
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300">
              Pemulihan Akun Aman
            </span>
          </div>

          <div className="flex flex-col gap-4 z-10">
            <h2 className="text-3xl font-extrabold leading-snug">
              Perlindungan Akun & Keamanan Data
            </h2>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              STAS-RG menerapkan verifikasi email satu kali (OTP) dan pembatasan laju pengiriman (*rate-limit*) untuk menjaga akun Anda tetap terlindungi dari akses tanpa izin.
            </p>

            <div className="flex flex-col gap-2 pt-2 text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Kode OTP hanya berlaku selama 5 menit.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Konfirmasi email otomatis dikirim setelah reset berhasil.</span>
              </div>
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

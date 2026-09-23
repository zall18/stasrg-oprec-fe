"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  ArrowLeft,
} from "lucide-react";

function ConfirmAdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [confirmedEmail, setConfirmedEmail] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage(
        "Token konfirmasi tidak ditemukan pada tautan ini. Silakan buka kembali tautan dari email resmi Anda."
      );
      return;
    }

    let isMounted = true;

    const verifyToken = async () => {
      try {
        const res = await api.confirmAdmin(token);
        if (!isMounted) return;

        const email = res.data?.data?.email || "";
        setConfirmedEmail(email);
        setStatus("success");
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg =
          err instanceof Error
            ? err.message
            : "Token konfirmasi tidak valid atau telah kadaluarsa (berlaku 24 jam).";
        setErrorMessage(msg);
        setStatus("error");
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Auto redirect countdown on success
  useEffect(() => {
    if (status !== "success") return;

    if (countdown <= 0) {
      router.push(
        `/auth/login?confirmed=true${
          confirmedEmail ? `&email=${encodeURIComponent(confirmedEmail)}` : ""
        }`
      );
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status, countdown, router, confirmedEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center p-3.5 sm:p-8">
      <div className="max-w-xl w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>
        </div>

        <GlassCard className="p-6 sm:p-10 border-white/60 shadow-2xl backdrop-blur-xl bg-white/40">
          {/* Loading State */}
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#274432]/10 text-[#274432] flex items-center justify-center shadow-inner">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Badge variant="GOLDEN" className="mx-auto text-[10px] tracking-wider uppercase font-bold">
                  Verifikasi Kriptografis
                </Badge>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A201C] mt-2">
                  Mengaktifkan Akun Administrator...
                </h1>
                <p className="text-xs text-[#64746A] max-w-sm mx-auto">
                  Sistem sedang memvalidasi token otorisasi digital dan mengaktifkan hak akses laboratorium Anda.
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-4 text-center gap-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner ring-4 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="flex flex-col gap-2">
                <Badge variant="DITERIMA" className="mx-auto text-[11px] font-bold py-0.5 px-3">
                  👑 ADMINISTRATOR TERVERIFIKASI
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A201C]">
                  Aktivasi Akun Berhasil!
                </h1>
                <p className="text-xs text-[#64746A] max-w-md mx-auto leading-relaxed">
                  Selamat! Akun administrator{" "}
                  {confirmedEmail && (
                    <strong className="text-[#274432] font-semibold">{confirmedEmail} </strong>
                  )}
                  telah aktif sepenuhnya. Anda kini dapat masuk dan mengelola sistem seleksi laboratorium STAS-RG.
                </p>
              </div>

              {/* Status details card */}
              <div className="w-full bg-white/60 border border-emerald-200/60 rounded-xl p-4 flex flex-col gap-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64746A]">Status Akun:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Aktif & Terotorisasi
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64746A]">Peran Sistem:</span>
                  <span className="font-semibold text-[#1A201C]">Administrator Laboratorium</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64746A]">Pengalihan Otomatis:</span>
                  <span className="text-xs text-[#274432] font-semibold">
                    Ke login dalam {countdown} detik...
                  </span>
                </div>
              </div>

              <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="primary"
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() =>
                    router.push(
                      `/auth/login?confirmed=true${
                        confirmedEmail ? `&email=${encodeURIComponent(confirmedEmail)}` : ""
                      }`
                    )
                  }
                >
                  Masuk Sekarang
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-4 text-center gap-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-inner ring-4 ring-rose-50">
                <AlertTriangle className="w-9 h-9" />
              </div>

              <div className="flex flex-col gap-2">
                <Badge variant="DITOLAK" className="mx-auto text-[11px] font-bold py-0.5 px-3">
                  AKTIVASI GAGAL
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A201C]">
                  Tautan Tidak Valid atau Kadaluarsa
                </h1>
                <p className="text-xs text-rose-700/90 max-w-md mx-auto leading-relaxed bg-rose-50/70 p-3 rounded-lg border border-rose-200">
                  {errorMessage ||
                    "Tautan aktivasi akun administrator ini sudah tidak berlaku atau token telah kadaluarsa."}
                </p>
                <p className="text-[11px] text-[#64746A] max-w-sm mx-auto">
                  Catatan: Demi keamanan, tautan aktivasi administrator resmi memiliki batas masa aktif 24 jam. Jika membutuhkan tautan baru, silakan hubungi superadmin.
                </p>
              </div>

              <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/auth/login" className="w-full">
                  <Button variant="outline" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Kembali ke Halaman Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Security Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#64746A]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Sistem Otorisasi Kriptografis STAS-RG LAB. Akses Terenkripsi.</span>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#274432]" />
        </div>
      }
    >
      <ConfirmAdminContent />
    </Suspense>
  );
}

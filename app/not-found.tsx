import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Compass, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#F2F4F0] via-[#E8ECE5] to-[#DFE5DC]">
      <GlassCard className="max-w-lg w-full p-8 sm:p-10 text-center flex flex-col items-center gap-6 shadow-xl border-white/60">
        <Logo size="lg" />
        <div className="w-16 h-16 rounded-full bg-[#274432]/10 flex items-center justify-center text-[#274432]">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#274432]/70">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A201C]">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm text-[#64746A] leading-relaxed max-w-sm mx-auto">
            Halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau tautan yang dimasukkan salah.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
          <Link href="/">
            <Button
              variant="primary"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Ke Beranda
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button
              variant="secondary"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Masuk Akun
            </Button>
          </Link>
        </div>

        <p className="text-[11px] text-[#64746A]/80 pt-2 border-t border-black/5 w-full">
          Sistem Rekrutmen STAS-RG • Keamanan & Privasi Terjaga
        </p>
      </GlassCard>
    </div>
  );
}

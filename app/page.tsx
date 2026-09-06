"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Award,
  CheckCircle,
  FileCheck,
} from "lucide-react";
import { api } from "@/lib/api/client";

interface OprecStatus {
  isActive?: boolean;
  isOprecActive?: boolean;
  currentBatch?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export default function HomePage() {
  const [oprecStatus, setOprecStatus] = useState<OprecStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useEffect(() => {
    api
      .getOprecStatus()
      .then((res) => {
        if (res.data?.data) {
          setOprecStatus(res.data.data);
        }
      })
      .catch(() => {
        setOprecStatus({
          isOprecActive: true,
          currentBatch: "Batch 1 2026",
          description: "Periode Pendaftaran Terbuka STAS-RG",
        });
      })
      .finally(() => setIsLoadingStatus(false));
  }, []);

  const isActive = Boolean(
    oprecStatus?.isOprecActive ?? oprecStatus?.isActive ?? false
  );

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#274432] selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-4 backdrop-blur-md bg-white/30 border-b border-white/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo size="md" subtitle="Recruitment System" />
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/rekrutmen">
              <Button variant="ghost" size="sm" leftIcon={<FileCheck className="w-3.5 h-3.5" />}>
                Panduan & Daftar
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Masuk
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Buat Akun
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Hero */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-20 flex flex-col items-center gap-16 text-center">
        {/* Banner Status */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/50 border border-white/60 shadow-xs backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isActive ? "bg-emerald-400" : "bg-gray-400"
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isActive ? "bg-emerald-600" : "bg-gray-500"
              }`}
            ></span>
          </span>
          <span className="text-xs font-semibold text-[#1A201C]">
            {isLoadingStatus
              ? "Memeriksa periode pendaftaran..."
              : isActive
              ? `Pendaftaran Aktif: ${oprecStatus?.currentBatch || "Batch Terbuka"}`
              : "Pendaftaran Regular Sedang Ditutup"}
          </span>
          <Badge variant="GOLDEN">Golden Ticket Tersedia</Badge>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-5 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1A201C] leading-[1.15]">
            Membangun Masa Depan Bersama{" "}
            <span className="text-[#274432] underline decoration-emerald-600/30">
              STAS-RG
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#64746A] leading-relaxed max-w-2xl mx-auto">
            Laboratorium Smart Transportation & Autonomous Systems Research Group
            membuka peluang bagi talenta muda untuk berkontribusi dalam riset
            sistem otonom, kecerdasan buatan, dan teknologi mobilitas pintar.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/rekrutmen">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Info Rekrutmen & Formulir Pendaftaran
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="secondary" size="lg">
              Portal Akun Terdaftar
            </Button>
          </Link>
        </div>

        {/* 3 Pillars / Roles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8 text-left">
          {/* Card 1: Riset */}
          <GlassCard className="p-7 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-[#1A201C]">
                Mahasiswa Riset
              </h3>
              <p className="text-xs text-[#64746A] leading-relaxed">
                Fokus pada eksplorasi ilmiah, algoritma autonomous vehicle, computer
                vision, dan publikasi penelitian bereputasi nasional maupun internasional.
              </p>
            </div>
            <ul className="text-xs text-[#1A201C] flex flex-col gap-2 pt-2 border-t border-black/5 mt-auto">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Bimbingan publikasi jurnal/konferensi</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Akses ke platform sensor & simulator robotik</span>
              </li>
            </ul>
          </GlassCard>

          {/* Card 2: Magang */}
          <GlassCard className="p-7 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-[#1A201C]">
                Mahasiswa Magang
              </h3>
              <p className="text-xs text-[#64746A] leading-relaxed">
                Mengembangkan produk perangkat lunak, integrasi IoT, dan penerapan
                solusi sistem transportasi pintar langsung ke dalam proyek industri lab.
              </p>
            </div>
            <ul className="text-xs text-[#1A201C] flex flex-col gap-2 pt-2 border-t border-black/5 mt-auto">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Portofolio proyek nyata skala industri</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Konversi SKS magang & mentoring profesional</span>
              </li>
            </ul>
          </GlassCard>

          {/* Card 3: Golden Candidate */}
          <GlassCard
            variant="tinted"
            className="p-7 flex flex-col gap-4 border-[#274432]/20 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-900">
              <Award className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1A201C]">
                  Golden Candidate
                </h3>
                <Badge variant="GOLDEN">Prioritas</Badge>
              </div>
              <p className="text-xs text-[#64746A] leading-relaxed">
                Jalur eksklusif bagi mahasiswa dengan portofolio terbukti dan
                rekam jejak unggul untuk penugasan proyek khusus secara langsung.
              </p>
            </div>
            <ul className="text-xs text-[#1A201C] flex flex-col gap-2 pt-2 border-t border-black/5 mt-auto">
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Fast-track review oleh Principal Investigator</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Peluang langsung penugasan Assigned Project</span>
              </li>
            </ul>
          </GlassCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 sm:px-8 py-8 border-t border-black/5 bg-white/20 backdrop-blur-xs text-xs text-[#64746A]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <p>© {new Date().getFullYear()} STAS-RG Lab. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/rekrutmen" className="hover:text-[#1A201C]">
              Panduan Berkas
            </Link>
            <span>•</span>
            <span className="hover:text-[#1A201C] cursor-pointer">Kontak PIC Lab</span>
            <span>•</span>
            <span className="hover:text-[#1A201C] cursor-pointer">Kebijakan Privasi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
  Menu,
  X,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface OprecStatus {
  isActive?: boolean;
  isOprecActive?: boolean;
  isGoldenCandidateActive?: boolean;
  allowGoldenCandidate?: boolean;
  currentBatch?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export default function HomePage() {
  const [oprecStatus, setOprecStatus] = useState<OprecStatus | null>(null);
  const [announcements, setAnnouncements] = useState<Array<{ id: string; title: string; content: string }>>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    api
      .getAnnouncements()
      .then((res) => {
        if (Array.isArray(res.data?.data)) {
          setAnnouncements(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const isOprecActive = Boolean(
    oprecStatus?.isOprecActive ?? oprecStatus?.isActive ?? false
  );
  const isGoldenActive = Boolean(
    !isOprecActive && Boolean(oprecStatus?.isGoldenCandidateActive)
  );
  const isAnyActive = isOprecActive || isGoldenActive;

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#274432] selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 sm:py-4 backdrop-blur-md bg-white/40 border-b border-white/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo size="md" subtitle="Recruitment System" />
          </Link>

          {/* Desktop Navigation - Mutually Exclusive based on Active Mode */}
          <nav className="hidden md:flex items-center gap-2 sm:gap-3">
            {isOprecActive && (
              <Link href="/rekrutmen">
                <Button variant="ghost" size="sm" leftIcon={<FileCheck className="w-3.5 h-3.5" />}>
                  Panduan & Info Oprec
                </Button>
              </Link>
            )}

            {isGoldenActive && (
              <Link href="/golden-candidate">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-amber-800 hover:text-amber-900 font-semibold"
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-600" />}
                >
                  Jalur Golden
                </Button>
              </Link>
            )}

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

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-2xl bg-white/70 hover:bg-white text-[#1A201C] border border-black/5 shadow-xs transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-black/5 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
            {isOprecActive && (
              <Link href="/rekrutmen" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl hover:bg-white/60 text-xs font-semibold text-[#1A201C] transition-colors">
                  <FileCheck className="w-4 h-4 text-[#274432]" />
                  <span>Panduan & Info Oprec</span>
                </div>
              </Link>
            )}

            {isGoldenActive && (
              <Link href="/golden-candidate" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-50/70 border border-amber-500/20 text-xs font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Jalur Golden Candidate</span>
                </div>
              </Link>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/5">
              <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Masuk
                </Button>
              </Link>
              <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full text-xs">
                  Buat Akun
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Hero */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-20 flex flex-col items-center gap-10 sm:gap-16 text-center">
        {/* Banner Status */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2 rounded-2xl sm:rounded-full bg-white/50 border border-white/60 shadow-xs backdrop-blur-md max-w-full">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isAnyActive ? "bg-emerald-400" : "bg-gray-400"
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isAnyActive ? "bg-emerald-600" : "bg-gray-500"
              }`}
            ></span>
          </span>
          <span className="text-xs font-semibold text-[#1A201C]">
            {isLoadingStatus
              ? "Memeriksa periode pendaftaran..."
              : isOprecActive
              ? `Oprec Reguler Dibuka: ${oprecStatus?.currentBatch || "Batch Aktif"}`
              : isGoldenActive
              ? `Jalur Golden Candidate Dibuka: ${oprecStatus?.currentBatch || "Batch Aktif"}`
              : "Semua Jalur Pendaftaran Sedang Ditutup"}
          </span>
        </div>

        {/* Announcement Banner if present */}
        {announcements.length > 0 && (
          <div className="w-full max-w-3xl -mt-4 sm:-mt-8 p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-600/20 text-xs text-[#274432] font-medium flex flex-col sm:flex-row items-center justify-center gap-2 shadow-xs">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-[#274432] text-white px-2 py-0.5 rounded-full shrink-0">
              Pengumuman
            </span>
            <span className="truncate">
              <strong>{announcements[0].title}</strong> — {announcements[0].content}
            </span>
          </div>
        )}

        {/* Heading */}
        <div className="flex flex-col gap-4 sm:gap-5 max-w-3xl">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1A201C] leading-[1.15]">
            Membangun Masa Depan Bersama{" "}
            <span className="text-[#274432] underline decoration-emerald-600/30">
              STAS-RG
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-[#64746A] leading-relaxed max-w-2xl mx-auto">
            Laboratorium Smart Transportation & Autonomous Systems Research Group
            membuka peluang bagi talenta muda untuk berkontribusi dalam riset
            sistem otonom, kecerdasan buatan, dan teknologi mobilitas pintar.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full">
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto justify-center"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Login untuk Mendaftar
              </Button>
            </Link>
            {isGoldenActive ? (
              <Link href="/golden-candidate" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto justify-center text-amber-900 border-amber-500/20 bg-amber-50/50 hover:bg-amber-100/60" leftIcon={<Sparkles className="w-4 h-4 text-amber-600" />}>
                  Pelajari Jalur Golden
                </Button>
              </Link>
            ) : (
              <Link href="/rekrutmen" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto justify-center">
                  Pelajari Alur Rekrutmen
                </Button>
              </Link>
            )}
          </div>
          <span className="text-xs text-[#64746A]">
            * Anda wajib login terlebih dahulu ke akun kandidat untuk mengisi formulir pendaftaran.
          </span>
        </div>

        {/* 3 Pillars / Roles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8 text-left">
          {/* Card 1: Riset */}
          <GlassCard className={cn("p-7 flex flex-col gap-4 hover:shadow-md transition-shadow", isGoldenActive && "opacity-75")}>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                <GraduationCap className="w-6 h-6" />
              </div>
              {isOprecActive && (
                <Badge variant="DITERIMA">Batch Aktif</Badge>
              )}
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
          <GlassCard className={cn("p-7 flex flex-col gap-4 hover:shadow-md transition-shadow", isGoldenActive && "opacity-75")}>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#274432]/10 flex items-center justify-center text-[#274432]">
                <Briefcase className="w-6 h-6" />
              </div>
              {isOprecActive && (
                <Badge variant="DITERIMA">Batch Aktif</Badge>
              )}
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
            className={cn(
              "p-7 flex flex-col gap-4 border-[#274432]/20 hover:shadow-md transition-shadow",
              isGoldenActive && "ring-2 ring-amber-500/40 bg-amber-500/10 shadow-md",
              isOprecActive && "opacity-75"
            )}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-900">
              <Award className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1A201C]">
                  Golden Candidate
                </h3>
                <Badge variant="GOLDEN">
                  {isGoldenActive ? "Jalur Terbuka" : "Prioritas"}
                </Badge>
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
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <p>© {new Date().getFullYear()} STAS-RG Lab. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {isOprecActive && (
              <Link href="/rekrutmen" className="hover:text-[#1A201C] py-1">
                Panduan Berkas
              </Link>
            )}
            {isGoldenActive && (
              <Link href="/golden-candidate" className="hover:text-[#1A201C] py-1">
                Panduan Golden Candidate
              </Link>
            )}
            <span>•</span>
            <span className="hover:text-[#1A201C] cursor-pointer py-1">Kontak PIC Lab</span>
            <span>•</span>
            <span className="hover:text-[#1A201C] cursor-pointer py-1">Kebijakan Privasi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Sparkles,
  Award,
  Zap,
  Cpu,
  BookOpen,
  CheckCircle,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export const metadata = {
  title: "Jalur Golden Candidate | STAS-RG Research Group",
  description:
    "Peluang eksklusif bagi talenta unggul untuk bergabung dengan grup riset STAS-RG melalui jalur akselerasi fast-track.",
};

export default function GoldenCandidatePublicPage() {
  const benefits = [
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: "Fast-Track Seleksi",
      description:
        "Bebas antrean panjang seleksi berkas reguler. Aplikasi Anda langsung ditinjau oleh pimpinan riset dan berkesempatan langsung ke tahap wawancara.",
    },
    {
      icon: <Cpu className="w-6 h-6 text-[#274432]" />,
      title: "Matching Proyek Prioritas",
      description:
        "Diprioritaskan untuk ditempatkan pada topik riset mutakhir seperti TinyML, AI Edge, IoT Sensor Networks, dan Autonomous Systems.",
    },
    {
      icon: <Award className="w-6 h-6 text-emerald-600" />,
      title: "Mentoring Langsung Pimpinan",
      description:
        "Bimbingan intensif 1-on-1 bersama Lead Researcher STAS-RG dan dukungan penuh untuk publikasi jurnal internasional (Scopus/IEEE).",
    },
  ];

  const criteria = [
    "Mahasiswa aktif dengan IPK minimal 3.50 (skala 4.00) atau memiliki rekam jejak prestasi istimewa",
    "Memiliki portofolio teknis, repositori GitHub aktif, atau keterlibatan dalam proyek inovatif",
    "Memiliki komitmen waktu riset minimal 10 jam/minggu di Laboratorium STAS-RG",
    "Memiliki esai motivasi mendalam serta rekomendasi dari dosen / mentor riset",
  ];

  const faqs = [
    {
      q: "Apa perbedaan Golden Candidate dengan Oprec Reguler?",
      a: "Jalur Golden ditujukan bagi mahasiswa dengan rekam jejak akademik atau portofolio riset tinggi, dengan benefit akselerasi wawancara dan alokasi proyek riset strategis.",
    },
    {
      q: "Jika tidak lolos jalur Golden, apakah masih bisa ikut jalur reguler?",
      a: "Ya, berkas Anda akan otomatis dialihkan ke antrean seleksi berkas reguler tanpa perlu mendaftar ulang.",
    },
    {
      q: "Bagaimana cara mendaftarnya?",
      a: "Cukup buat akun di portal STAS-RG, lengkapi profil Anda, lalu buka menu Formulir Golden Candidate di dashboard Anda.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F2F4F0] flex flex-col selection:bg-[#274432] selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 py-3.5 sm:py-4 backdrop-blur-md bg-white/40 border-b border-white/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" subtitle="Jalur Unggulan Riset" />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="text-xs px-2.5 sm:px-4">
                Masuk
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="primary" size="sm" className="text-xs px-2.5 sm:px-4">
                Daftar Akun
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 pt-10 sm:pt-16 pb-12 sm:pb-20 text-center max-w-4xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/50 text-amber-900 text-xs font-bold mb-4 sm:mb-6 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Jalur Khusus Prestasi & Talenta Riset</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1A201C] tracking-tight mb-4 sm:mb-6 leading-tight px-2">
          Akselerasi Karier Riset Anda Bersama{" "}
          <span className="text-[#274432] underline decoration-emerald-500/30">
            Golden Candidate STAS-RG
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-[#64746A] max-w-2xl leading-relaxed mb-6 sm:mb-8">
          Jalur penerimaan khusus bagi mahasiswa dengan dedikasi tinggi, portofolio
          solid, dan ambisi untuk menghasilkan riset berdampak global di laboratorium
          Smarter Things & Autonomous Systems Research Group.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Link href="/dashboard/golden-candidate" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto justify-center px-6 sm:px-8 shadow-xl shadow-[#274432]/20"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Isi Formulir Golden Candidate
            </Button>
          </Link>
          <a href="#kriteria" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto justify-center">
              Lihat Kriteria & Syarat
            </Button>
          </a>
        </div>
        <span className="text-xs text-[#64746A] mt-3">
          * Anda wajib login ke akun portal kandidat untuk dapat mengisi formulir.
        </span>
      </section>

      {/* Key Benefits */}
      <section className="px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A201C]">
            Keunggulan Eksklusif Jalur Golden
          </h2>
          <p className="text-xs sm:text-sm text-[#64746A] mt-1">
            Didesain khusus untuk memaksimalkan potensi terbaik Anda sejak hari pertama
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {benefits.map((b, i) => (
            <GlassCard
              key={i}
              className="p-5 sm:p-6 flex flex-col gap-4 border border-white/80 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center shadow-xs">
                {b.icon}
              </div>
              <h3 className="text-base font-bold text-[#1A201C]">{b.title}</h3>
              <p className="text-xs text-[#64746A] leading-relaxed">
                {b.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Criteria & Requirements */}
      <section id="kriteria" className="px-4 sm:px-6 py-8 sm:py-12 max-w-4xl mx-auto w-full scroll-mt-20">
        <GlassCard className="p-5 sm:p-8 border border-white/80 bg-white/70">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-[#274432]" />
            <h3 className="text-xl font-bold text-[#1A201C]">
              Kriteria & Syarat Pendaftar
            </h3>
          </div>

          <div className="space-y-4">
            {criteria.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#1A201C]/90 leading-relaxed font-medium">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* FAQ */}
      <section className="px-6 py-12 max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1A201C]">Pertanyaan Umum</h2>
          <p className="text-sm text-[#64746A]">
            Hal yang sering ditanyakan seputar jalur Golden Candidate
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/60 border border-white/80 shadow-xs"
            >
              <h4 className="text-sm font-bold text-[#1A201C] flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-emerald-800 shrink-0" />
                {faq.q}
              </h4>
              <p className="text-xs text-[#64746A] leading-relaxed ml-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-16 text-center max-w-3xl mx-auto">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-[#274432] to-[#1e3426] text-white shadow-2xl flex flex-col items-center">
          <Sparkles className="w-10 h-10 text-amber-300 mb-4" />
          <h3 className="text-2xl font-bold mb-2">Siap Bergabung dengan STAS-RG?</h3>
          <p className="text-xs text-white/80 max-w-md mb-6 leading-relaxed">
            Ambil kesempatan emas ini dan wujudkan kontribusi riset nyata bersama
            tim peneliti terbaik kami.
          </p>
          <Link href="/dashboard/golden-candidate">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-[#274432] hover:bg-[#F2F4F0] font-bold"
            >
              Ajukan Jalur Golden Candidate Sekarang
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

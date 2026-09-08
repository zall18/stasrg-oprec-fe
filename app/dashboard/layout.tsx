"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  User,
  FileText,
  Rocket,
  LogOut,
  Loader2,
  Calendar,
  History,
  Sparkles,
} from "lucide-react";
import { NotificationBell } from "@/components/ui/notification-bell";
import { cn } from "@/lib/utils";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loadFromStorage, clearAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setIsChecking(false);
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isChecking) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else if (user?.role === "ADMIN") {
        router.push("/admin/dashboard");
      }
    }
  }, [isChecking, isAuthenticated, user, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F4F0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#274432]" />
      </div>
    );
  }

  const handleLogout = () => {
    clearAuth();
    router.push("/auth/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <User className="w-4 h-4" />,
    },
    {
      label: "Profil Saya",
      href: "/dashboard/profile",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: "Pendaftaran Oprec",
      href: "/dashboard/oprec",
      icon: <Rocket className="w-4 h-4" />,
    },
    {
      label: "Jalur Golden Candidate",
      href: "/dashboard/golden-candidate",
      icon: <Sparkles className="w-4 h-4 text-amber-600" />,
    },
    {
      label: "Jadwal Wawancara",
      href: "/dashboard/interviews",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      label: "Riwayat Pendaftaran",
      href: "/dashboard/history",
      icon: <History className="w-4 h-4" />,
    },
  ];


  return (
    <div className="min-h-screen flex bg-[#F2F4F0]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Candidate Sidebar */}
      <aside
        data-testid="candidate-sidebar"
        className={cn(
          "fixed lg:static top-0 bottom-0 left-0 z-50 w-72 flex flex-col justify-between p-6 bg-white/60 backdrop-blur-xl border-r border-white/60 shadow-xl lg:shadow-none transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)}>
              <Logo size="md" subtitle="Candidate Portal" />
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-full hover:bg-black/5 text-[#64746A]"
            >
              <LogOut className="w-5 h-5 rotate-180" />
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#274432]/70 ml-3 mb-1">
              Menu Seleksi
            </span>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 select-none",
                      isActive
                        ? "bg-[#274432] text-white shadow-md shadow-[#274432]/10"
                        : "text-[#64746A] hover:text-[#1A201C] hover:bg-white/50"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: Notification & User Info */}
        <div className="flex flex-col gap-3 pt-6 border-t border-black/5">
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="text-xs font-bold text-[#1A201C]">Notifikasi</span>
            <NotificationBell />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/40 border border-black/5">
            <div className="flex flex-col truncate pr-2">
              <span className="text-xs font-semibold text-[#1A201C] truncate">
                {user?.email}
              </span>
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                Akun Kandidat
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-rose-100 rounded-full text-rose-600 transition-colors shrink-0 cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/40 backdrop-blur-md border-b border-white/50 sticky top-0 z-30">
          <Logo size="sm" subtitle="Candidate Panel" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/60 text-[#1A201C] border border-black/5"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page Children */}
        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

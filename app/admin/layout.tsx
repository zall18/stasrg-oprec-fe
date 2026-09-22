"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Loader2,
  FileSpreadsheet,
  Menu,
  X,
  Layers,
  CalendarCheck,
  Megaphone,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { user, isAuthenticated, loadFromStorage, clearAuth } = useAuthStore();

  const isClient = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isClient) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else if (user?.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [isClient, isAuthenticated, user, router]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await api.exportCandidates();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `kandidat_stasrg_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Data kandidat berhasil diekspor!");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunduh file ekspor data kandidat");
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/auth/login");
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F4F0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#274432]" />
      </div>
    );
  }

  const navItems = [
    {
      label: "Ringkasan & Statistik",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Manajemen Pelamar",
      href: "/admin/candidates",
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: "Manajemen Batch",
      href: "/admin/oprec",
      icon: <Layers className="w-4 h-4" />,
    },
    {
      label: "Jadwal Wawancara",
      href: "/admin/interviews",
      icon: <CalendarCheck className="w-4 h-4" />,
    },
    {
      label: "Log Aktivitas",
      href: "/admin/logs",
      icon: <Activity className="w-4 h-4" />,
    },
    {
      label: "Pengumuman",
      href: "/admin/announcements",
      icon: <Megaphone className="w-4 h-4" />,
    },
    {
      label: "Kelola Admin",
      href: "/admin/admins",
      icon: <ShieldCheck className="w-4 h-4" />,
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

      {/* Admin Sidebar */}
      <aside
        data-testid="admin-sidebar"
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-72 flex flex-col shrink-0 bg-white/80 backdrop-blur-2xl border-r border-white/60 shadow-xl lg:shadow-none transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Top: Logo & Brand - Fixed Header */}
        <div className="p-6 pb-4 shrink-0 flex items-center justify-between border-b border-black/5 lg:border-none">
          <Link href="/admin/dashboard" onClick={() => setIsSidebarOpen(false)}>
            <Logo size="md" subtitle="Admin PIC Seleksi" />
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-full hover:bg-black/5 text-[#64746A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Middle Scrollable Section: Nav Links & Oprec Widget */}
        <div className="flex-1 overflow-y-auto px-6 py-2 min-h-0 space-y-4 scrollbar-thin">
          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#274432]/70 ml-3 mb-1">
              Menu Utama
            </span>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/admin/candidates" &&
                  pathname.startsWith("/admin/candidates"));
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

        {/* Bottom Area: Export, Admin Info, Logout - Fixed at bottom */}
        <div className="p-6 pt-4 shrink-0 border-t border-black/5 flex flex-col gap-3 mt-auto bg-white/40">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            isLoading={isExporting}
            onClick={handleExport}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />}
          >
            Ekspor Data (CSV)
          </Button>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/60 border border-black/5 shadow-2xs">
            <div className="flex flex-col truncate pr-2">
              <span className="text-xs font-semibold text-[#1A201C] truncate">
                {user?.email}
              </span>
              <span className="text-[10px] text-purple-900 font-bold uppercase tracking-wider">
                Administrator
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
        <div className="lg:hidden flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-white/40 backdrop-blur-md border-b border-white/50 sticky top-0 z-30">
          <Logo size="sm" subtitle="Admin Panel" />
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/60 text-[#1A201C] border border-black/5"
            aria-label="Buka menu navigasi admin"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Page Children */}
        <main className="flex-1 p-3.5 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

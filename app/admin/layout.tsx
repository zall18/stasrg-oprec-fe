"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Loader2,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight,
  Settings,
  Calendar,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Sparkles,
  Layers,
  CalendarCheck,
  Megaphone,
  Activity,
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
  const queryClient = useQueryClient();
  const { user, isAuthenticated, loadFromStorage, clearAuth } = useAuthStore();

  const [isChecking, setIsChecking] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOprecExpanded, setIsOprecExpanded] = useState(false);
  const [batchNameInput, setBatchNameInput] = useState("");

  useEffect(() => {
    loadFromStorage();
    setIsChecking(false);
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isChecking) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else if (user?.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [isChecking, isAuthenticated, user, router]);

  // Query Oprec Settings for the Sidebar Widget
  const { data: settingData, isLoading: isLoadingSetting } = useQuery({
    queryKey: ["oprecSettings"],
    queryFn: async () => {
      const res = await api.getRecruitmentSetting();
      return res.data?.data;
    },
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  useEffect(() => {
    if (settingData?.currentBatch) {
      setBatchNameInput(settingData.currentBatch);
    }
  }, [settingData]);

  // Toggle Oprec Active Status mutation
  const toggleMutation = useMutation({
    mutationFn: async ({
      isActive,
      currentBatch,
    }: {
      isActive: boolean;
      currentBatch?: string;
    }) => {
      return api.updateRecruitmentSetting({
        isActive,
        currentBatch: currentBatch || settingData?.currentBatch || "Batch 1",
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["oprecSettings"] });
      queryClient.invalidateQueries({ queryKey: ["oprecStatus"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      toast.success(
        variables.isActive
          ? "Pendaftaran Oprec berhasil DIAKTIFKAN!"
          : "Pendaftaran Oprec berhasil DITUTUP!"
      );
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal mengubah status pendaftaran");
    },
  });

  const isOprecActive = Boolean(settingData?.isActive);

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

  if (isChecking) {
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

          {/* SIDEBAR WIDGET: Kendali & Atur Open Recruitment */}
          <div className="p-4 rounded-3xl bg-[#F5F7EC]/80 border border-[#274432]/15 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#274432]" />
                <span className="text-xs font-bold text-[#1A201C]">
                  Atur Pendaftaran
                </span>
              </div>
              <Badge variant={isOprecActive ? "DITERIMA" : "PENDING"}>
                {isOprecActive ? "Buka" : "Tutup"}
              </Badge>
            </div>

            <div className="flex flex-col gap-1 text-[11px]">
              <span className="text-[#64746A]">Batch Aktif:</span>
              <span className="font-semibold text-[#1A201C] truncate">
                {settingData?.currentBatch || "Batch 1 - 2026"}
              </span>
            </div>

            {/* Quick Toggle Button */}
            <Button
              variant={isOprecActive ? "primary" : "secondary"}
              size="sm"
              className="w-full text-xs py-2"
              isLoading={toggleMutation.isPending}
              onClick={() =>
                toggleMutation.mutate({
                  isActive: !isOprecActive,
                  currentBatch: batchNameInput || settingData?.currentBatch,
                })
              }
              leftIcon={
                isOprecActive ? (
                  <ToggleRight className="w-4 h-4" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )
              }
            >
              {isOprecActive ? "Tutup Pendaftaran" : "Buka Pendaftaran"}
            </Button>

            {/* Collapsible Edit Batch Details */}
            <button
              type="button"
              onClick={() => setIsOprecExpanded(!isOprecExpanded)}
              className="flex items-center justify-center gap-1 text-[10px] text-[#274432] font-semibold hover:underline pt-1 cursor-pointer"
            >
              <span>{isOprecExpanded ? "Tutup Pengaturan" : "Ubah Nama Batch"}</span>
              {isOprecExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {isOprecExpanded && (
              <div className="flex flex-col gap-2 pt-2 border-t border-black/5 animate-in fade-in">
                <Input
                  value={batchNameInput}
                  onChange={(e) => setBatchNameInput(e.target.value)}
                  placeholder="Nama Batch Baru"
                  className="text-xs py-2"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  isLoading={toggleMutation.isPending}
                  onClick={() =>
                    toggleMutation.mutate({
                      isActive: isOprecActive,
                      currentBatch: batchNameInput,
                    })
                  }
                >
                  Simpan Nama Batch
                </Button>
              </div>
            )}
          </div>
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

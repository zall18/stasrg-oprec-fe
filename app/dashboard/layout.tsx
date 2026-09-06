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
} from "lucide-react";
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
      label: "Formulir Golden Candidate",
      href: "/dashboard/golden-candidate",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: "Pendaftaran Oprec",
      href: "/dashboard/oprec",
      icon: <Rocket className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F4F0]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 backdrop-blur-md bg-white/40 border-b border-white/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard">
            <Logo size="sm" subtitle="Candidate Portal" />
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-[#1A201C] truncate max-w-[200px]">
                {user?.email}
              </span>
              <span className="text-[10px] text-emerald-800 font-medium">
                Akun Kandidat
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Bar */}
      <div className="w-full bg-white/20 border-b border-black/5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                    isActive
                      ? "bg-[#274432] text-white shadow-xs"
                      : "text-[#64746A] hover:text-[#1A201C] hover:bg-white/40"
                  )}
                >
                  {item.icon}
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

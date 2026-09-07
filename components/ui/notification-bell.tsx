"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Clock, Inbox } from "lucide-react";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title?: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ["unreadNotificationsCount"],
    queryFn: async () => {
      try {
        const res = await api.getUnreadNotificationCount();
        return res.data?.data?.unreadCount || 0;
      } catch {
        return 0;
      }
    },
    refetchInterval: 30000,
  });

  // Fetch list of notifications when opened
  const { data: notifList, isLoading } = useQuery({
    queryKey: ["candidateNotificationsList"],
    queryFn: async () => {
      try {
        const res = await api.getCandidateNotifications({ page: 1, limit: 10 });
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        return list as NotificationItem[];
      } catch {
        return [] as NotificationItem[];
      }
    },
    enabled: isOpen,
  });

  // Mark notification read mutation
  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationsCount"] });
      queryClient.invalidateQueries({ queryKey: ["candidateNotificationsList"] });
    },
  });

  const unreadCount = Number(unreadData || 0);

  return (
    <div className="relative" ref={dropdownRef} data-testid="notification-bell">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-[#64746A] hover:text-[#1A201C] hover:bg-white/60 transition-colors focus:outline-hidden"
        aria-label="Buka notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            data-testid="unread-badge"
            className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs animate-bounce"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 border-b border-black/5 flex items-center justify-between">
            <span className="text-xs font-bold text-[#1A201C] flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-[#274432]" />
              Notifikasi Pendaftaran
            </span>
            {unreadCount > 0 && (
              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                {unreadCount} belum dibaca
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-black/5">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-[#64746A]">
                Memuat notifikasi...
              </div>
            ) : !notifList || notifList.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-2">
                <Inbox className="w-8 h-8 text-[#64746A]/40" />
                <span className="text-xs font-medium text-[#64746A]">
                  Belum ada notifikasi baru
                </span>
              </div>
            ) : (
              notifList.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) {
                      markReadMutation.mutate(notif.id);
                    }
                  }}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-black/[0.02] transition-colors flex flex-col gap-1 text-left",
                    !notif.isRead && "bg-emerald-50/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1A201C] line-clamp-1">
                      {notif.title || "Pemberitahuan Rekrutmen"}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#64746A] leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-[#64746A]/70 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

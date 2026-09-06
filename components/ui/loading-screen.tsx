"use client";

import React from "react";
import Image from "next/image";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { GlassCard } from "./glass-card";

export interface LoadingScreenProps {
  showFullscreen?: boolean;
  message?: string;
}

export const GlobalLoadingBar: React.FC = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const activeRequests = isFetching + isMutating;

  if (activeRequests === 0) return null;

  return (
    <div
      data-testid="global-loading-bar"
      className="fixed top-0 left-0 right-0 z-50 h-1 overflow-hidden bg-[#274432]/10"
    >
      <div className="h-full bg-gradient-to-r from-emerald-600 via-[#274432] to-amber-500 animate-[loading_1.5s_infinite_linear] origin-left w-full" />
    </div>
  );
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  showFullscreen = false,
  message = "Memuat data...",
}) => {
  if (!showFullscreen) return null;

  return (
    <div
      data-testid="loading-screen"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md animate-in fade-in duration-200"
    >
      <GlassCard className="p-8 max-w-xs w-full flex flex-col items-center gap-4 text-center border-white/70 shadow-2xl">
        <div className="relative w-16 h-16 rounded-2xl bg-white/60 p-2 border border-white/80 shadow-md flex items-center justify-center">
          <Image
            src="/STASRG.png"
            alt="Loading STAS-RG"
            width={48}
            height={48}
            className="object-contain animate-pulse"
          />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1A201C]">
            <Loader2 className="w-4 h-4 animate-spin text-[#274432]" />
            <span>{message}</span>
          </div>
          <span className="text-[11px] text-[#64746A]">
            Mohon tunggu sejenak
          </span>
        </div>
      </GlassCard>
    </div>
  );
};

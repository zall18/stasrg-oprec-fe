import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "PENDING"
  | "SELEKSI_BERKAS"
  | "WAWANCARA_1"
  | "WAWANCARA_2"
  | "DITERIMA"
  | "DITOLAK"
  | "GOLDEN"
  | "DEFAULT";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "DEFAULT",
  children,
  className,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    PENDING: "bg-gray-500/20 text-gray-800 border border-gray-500/20",
    SELEKSI_BERKAS: "bg-blue-500/20 text-blue-800 border border-blue-500/20",
    WAWANCARA_1: "bg-purple-500/20 text-purple-800 border border-purple-500/20",
    WAWANCARA_2: "bg-purple-500/20 text-purple-800 border border-purple-500/20",
    DITERIMA: "bg-emerald-500/20 text-emerald-800 border border-emerald-500/20",
    DITOLAK: "bg-red-500/20 text-red-800 border border-red-500/20",
    GOLDEN: "bg-amber-500/20 text-amber-900 border border-amber-500/30 shadow-xs",
    DEFAULT: "bg-black/5 text-[#1A201C] border border-black/10",
  };

  const labelMap: Partial<Record<BadgeVariant, string>> = {
    PENDING: "Pending",
    SELEKSI_BERKAS: "Seleksi Berkas",
    WAWANCARA_1: "Wawancara 1",
    WAWANCARA_2: "Wawancara 2",
    DITERIMA: "Diterima",
    DITOLAK: "Ditolak",
    GOLDEN: "★ Golden Ticket",
  };

  return (
    <span
      data-testid="status-badge"
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs transition-colors",
        variantStyles[variant] || variantStyles.DEFAULT,
        className
      )}
      {...props}
    >
      {children || labelMap[variant] || variant}
    </span>
  );
};

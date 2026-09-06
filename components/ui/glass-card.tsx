import React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dense" | "tinted";
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = "light",
  ...props
}) => {
  const variantStyles = {
    light: "bg-white/40 backdrop-blur-md border border-white/40",
    dense: "bg-white/70 backdrop-blur-lg border border-white/60",
    tinted: "bg-[#F5F7EC]/60 backdrop-blur-md border border-[#274432]/10",
  };

  return (
    <div
      data-testid="glass-card"
      className={cn(
        "rounded-3xl shadow-sm transition-all duration-200",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

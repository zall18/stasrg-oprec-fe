import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  subtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = "md",
  showText = true,
  subtitle = "Recruitment System",
}) => {
  const sizeMap = {
    sm: { img: 28, text: "text-sm", sub: "text-[9px]" },
    md: { img: 36, text: "text-base", sub: "text-[10px]" },
    lg: { img: 48, text: "text-xl", sub: "text-xs" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      <div className="relative rounded-2xl overflow-hidden bg-white/50 p-1 border border-white/60 shadow-xs flex items-center justify-center shrink-0">
        <Image
          src="/STASRG.png"
          alt="STAS-RG Logo"
          width={currentSize.img}
          height={currentSize.img}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col text-left">
          <span className={cn("font-extrabold tracking-tight text-[#1A201C] leading-none", currentSize.text)}>
            STAS-RG
          </span>
          {subtitle && (
            <span className={cn("text-[#64746A] uppercase tracking-wider font-semibold mt-0.5", currentSize.sub)}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

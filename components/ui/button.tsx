import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-[#274432]/90 hover:bg-[#274432] text-white shadow-sm hover:shadow backdrop-blur-sm",
      secondary:
        "bg-white/40 hover:bg-white/60 text-[#274432] border border-white/50 backdrop-blur-sm shadow-sm",
      outline:
        "bg-transparent hover:bg-white/30 text-[#274432] border border-[#274432]/30 backdrop-blur-sm",
      ghost: "bg-transparent hover:bg-black/5 text-[#274432]",
      danger:
        "bg-rose-600/90 hover:bg-rose-700 text-white shadow-sm backdrop-blur-sm",
    };

    const sizeStyles = {
      sm: "px-4 py-1.5 text-xs gap-1.5",
      md: "px-6 py-2.5 text-sm gap-2",
      lg: "px-8 py-3.5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2
            data-testid="loading-spinner"
            className="w-4 h-4 animate-spin shrink-0"
          />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

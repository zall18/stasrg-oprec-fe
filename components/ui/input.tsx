import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-[#274432]/80 ml-2"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-4 pointer-events-none text-[#64746A]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full bg-[#F5F7EC]/60 focus:bg-[#F5F7EC]/90 border border-black/5 focus:border-[#274432]/40 rounded-full px-5 py-3 text-sm text-[#1A201C] outline-none transition-all duration-200 backdrop-blur-sm placeholder:text-[#64746A]/70 shadow-inner",
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              error && "border-rose-500/80 focus:border-rose-500 bg-rose-50/40",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 text-[#64746A]">{rightIcon}</div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-600 font-medium ml-3">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#64746A] ml-3">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

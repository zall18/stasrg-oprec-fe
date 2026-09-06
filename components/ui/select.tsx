import React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold uppercase tracking-wider text-[#274432]/80 ml-2"
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full appearance-none bg-[#F5F7EC]/60 focus:bg-[#F5F7EC]/90 border border-black/5 focus:border-[#274432]/40 rounded-full px-5 py-3 text-sm text-[#1A201C] outline-none transition-all duration-200 backdrop-blur-sm cursor-pointer shadow-inner pr-10",
              error && "border-rose-500/80 focus:border-rose-500 bg-rose-50/40",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-[#1A201C]">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64746A]">
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
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

Select.displayName = "Select";

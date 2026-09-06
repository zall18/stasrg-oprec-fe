import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((msg: string) => showToast(msg, "success"), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, "error"), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, "warning"), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, "info"), [showToast]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-[#274432] shrink-0" />,
  };

  const bgStyles: Record<ToastType, string> = {
    success: "bg-emerald-50/90 border-emerald-500/30 text-emerald-950",
    error: "bg-rose-50/90 border-rose-500/30 text-rose-950",
    warning: "bg-amber-50/90 border-amber-500/30 text-amber-950",
    info: "bg-white/90 border-white/60 text-[#1A201C]",
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div
        data-testid="toast-container"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            data-testid={`toast-${toast.type}`}
            className={cn(
              "pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5",
              bgStyles[toast.type]
            )}
          >
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <p className="text-xs font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/5 rounded-full transition-colors ml-2"
            >
              <X className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

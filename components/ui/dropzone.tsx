import React, { useRef, useState } from "react";
import { cn, formatBytes } from "@/lib/utils";
import { MAX_FILE_SIZE } from "@/lib/schemas/candidate.schema";
import { UploadCloud, FileCheck, AlertCircle, X } from "lucide-react";

export interface DropzoneProps {
  label: string;
  accept?: string;
  maxSizeBytes?: number;
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  error?: string;
  helperText?: string;
  currentUrl?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  label,
  accept = ".pdf,application/pdf",
  maxSizeBytes = MAX_FILE_SIZE,
  onFileSelect,
  selectedFile: propSelectedFile,
  error: externalError,
  helperText = "Format PDF, maksimal 5MB",
  currentUrl,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalSelectedFile, setInternalSelectedFile] = useState<File | null>(null);
  const selectedFile = propSelectedFile !== undefined ? propSelectedFile : internalSelectedFile;
  const setSelectedFile = setInternalSelectedFile;
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateAndSetFile = (file: File) => {
    setInternalError(null);

    // Format validation
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setInternalError("Format berkas wajib berupa PDF (.pdf)");
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    // Size validation
    if (file.size > maxSizeBytes) {
      setInternalError(
        `Ukuran file melebihi batas maksimal (${formatBytes(maxSizeBytes)}). File ini berukuran ${formatBytes(file.size)}.`
      );
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setInternalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect(null);
  };

  const activeError = externalError || internalError;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-[#274432]/80 ml-2">
        {label}
      </label>

      <div
        data-testid="dropzone-container"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "w-full border-2 border-dashed rounded-3xl p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2.5 backdrop-blur-sm select-none text-center",
          isDragOver
            ? "border-[#274432] bg-[#274432]/10 scale-[1.01]"
            : "border-black/15 bg-white/30 hover:bg-white/50 hover:border-[#274432]/40",
          activeError && "border-rose-500/80 bg-rose-50/40"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
          data-testid="dropzone-input"
        />

        {selectedFile ? (
          <div className="flex items-center justify-between w-full max-w-md bg-white/80 rounded-full px-4 py-2.5 border border-black/5 shadow-xs">
            <div className="flex items-center gap-2.5 truncate">
              <FileCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <div className="flex flex-col text-left truncate">
                <span className="text-xs font-semibold text-[#1A201C] truncate">
                  {selectedFile.name}
                </span>
                <span className="text-[10px] text-[#64746A]">
                  {formatBytes(selectedFile.size)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-rose-100 rounded-full text-rose-600 transition-colors ml-2"
              title="Hapus file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : currentUrl ? (
          <div className="flex flex-col items-center gap-1 text-[#274432]">
            <FileCheck className="w-7 h-7 text-emerald-700" />
            <span className="text-xs font-semibold">Berkas tersimpan</span>
            <span className="text-[11px] text-[#64746A]">Klik untuk mengganti dengan berkas baru</span>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-[#274432]/10 flex items-center justify-center text-[#274432]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-[#1A201C]">
                Seret file ke sini atau <span className="text-[#274432] underline">pilih dari perangkat</span>
              </p>
              <p className="text-xs text-[#64746A]">{helperText}</p>
            </div>
          </>
        )}
      </div>

      {activeError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium ml-3 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
};

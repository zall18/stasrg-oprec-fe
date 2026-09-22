import { z } from "zod";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_FILE_TYPES = ["application/pdf"];

export const fileUploadSchema = z
  .instanceof(File, { message: "Berkas wajib diunggah" })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "Ukuran file maksimal 5MB",
  })
  .refine(
    (file) =>
      ACCEPTED_FILE_TYPES.includes(file.type) ||
      file.name.toLowerCase().endsWith(".pdf"),
    {
      message: "Format berkas harus berupa .pdf",
    }
  );

export const candidateProfileSchema = z.object({
  fullName: z
    .string({ required_error: "Nama lengkap wajib diisi" })
    .trim()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  universitas: z
    .string({ required_error: "Universitas wajib diisi" })
    .trim()
    .min(2, "Nama universitas minimal 2 karakter"),
  nim: z
    .string({ required_error: "NIM wajib diisi" })
    .trim()
    .min(4, "NIM minimal 4 karakter"),
  programStudi: z
    .string({ required_error: "Program studi wajib diisi" })
    .trim()
    .min(2, "Program studi minimal 2 karakter"),
  roleInterest: z.enum(["RISET", "MAGANG"], {
    errorMap: () => ({ message: "Pilih salah satu role: Riset atau Magang" }),
  }),
  cvUrl: z
    .string({ required_error: "Tautan CV wajib diisi" })
    .url("Format URL CV tidak valid"),
  portfolioUrl: z
    .string({ required_error: "Tautan portofolio wajib diisi" })
    .url("Format URL portofolio harus valid (https://...)"),
  transkripUrl: z
    .string()
    .url("Format URL transkrip tidak valid")
    .optional()
    .or(z.literal("")),
  ipk: z
    .number({ invalid_type_error: "IPK harus berupa angka" })
    .min(0, "IPK minimal 0.00")
    .max(4.0, "IPK maksimal 4.00")
    .optional(),
  semester: z
    .number({ invalid_type_error: "Semester harus berupa angka" })
    .int("Semester harus bilangan bulat")
    .min(1, "Semester minimal 1")
    .max(14, "Semester maksimal 14")
    .optional(),
  pengalaman: z.string().optional(),
});

export const applyOprecSchema = z.object({
  batchName: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "SELEKSI_BERKAS",
    "WAWANCARA_1",
    "WAWANCARA_2",
    "DITERIMA",
    "DITOLAK",
  ]),
});

export const assignProjectSchema = z.object({
  assignedProject: z
    .string({ required_error: "Nama proyek wajib diisi" })
    .trim()
    .min(3, "Nama proyek minimal 3 karakter"),
});

export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;
export type ApplyOprecInput = z.infer<typeof applyOprecSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type AssignProjectInput = z.infer<typeof assignProjectSchema>;

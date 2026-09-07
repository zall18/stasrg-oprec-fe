import { z } from "zod";

export const goldenApplicationSchema = z.object({
  motivasi: z
    .string()
    .min(50, "Esai motivasi minimal 50 karakter untuk jalur Golden Candidate"),
  pencapaian: z
    .string()
    .min(10, "Deskripsikan minimal 1 pencapaian/proyek unggulan Anda"),
  rekomendasi: z.string().optional(),
  registrationId: z.string().optional(),
});

export type GoldenApplicationInput = z.infer<typeof goldenApplicationSchema>;

export const goldenWizardStep1Schema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  universitas: z.string().min(2, "Universitas wajib diisi"),
  nim: z.string().min(4, "NIM minimal 4 karakter"),
  programStudi: z.string().min(2, "Program studi wajib diisi"),
  semester: z.coerce.number().min(1).max(14),
  ipk: z.coerce.number().min(0).max(4.0),
  roleInterest: z.enum(["RISET", "MAGANG"]),
});

export const goldenWizardStep2Schema = z.object({
  cvUrl: z.string().url("URL CV tidak valid"),
  portfolioUrl: z.string().url("URL Portfolio/GitHub tidak valid"),
  transkripUrl: z.string().url("URL Transkrip nilai tidak valid").optional().or(z.literal("")),
});

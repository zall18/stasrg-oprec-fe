import { z } from "zod";

export const createAdminSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .trim()
    .email("Format email tidak valid"),
  password: z
    .string({ required_error: "Password wajib diisi" })
    .min(8, "Password minimal 8 karakter"),
});

export const resetPasswordSchema = z.object({
  newPassword: z
    .string({ required_error: "Password baru wajib diisi" })
    .min(8, "Password baru minimal 8 karakter"),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

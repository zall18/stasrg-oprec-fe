import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .trim()
    .email("Format email tidak valid"),
  password: z
    .string({ required_error: "Password wajib diisi" })
    .min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .trim()
    .email("Format email tidak valid"),
  password: z
    .string({ required_error: "Password wajib diisi" })
    .min(6, "Password minimal 6 karakter"),
  otp: z
    .string({ required_error: "Kode OTP wajib diisi" })
    .trim()
    .length(6, "Kode OTP harus 6 digit angka")
    .regex(/^\d{6}$/, "Kode OTP hanya boleh berisi angka"),
  role: z.enum(["CANDIDATE", "ADMIN"]).default("CANDIDATE"),
});

export const sendOtpSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .trim()
    .email("Format email tidak valid"),
  purpose: z.enum(["REGISTRATION", "PASSWORD_RESET"]).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .trim()
    .email("Format email tidak valid"),
});

export const resetPasswordSchema = z
  .object({
    email: z
      .string({ required_error: "Email wajib diisi" })
      .trim()
      .email("Format email tidak valid"),
    otp: z
      .string({ required_error: "Kode OTP wajib diisi" })
      .trim()
      .length(6, "Kode OTP harus 6 digit angka")
      .regex(/^\d{6}$/, "Kode OTP hanya boleh berisi angka"),
    newPassword: z
      .string({ required_error: "Kata sandi baru wajib diisi" })
      .min(6, "Kata sandi baru minimal 6 karakter"),
    confirmPassword: z
      .string({ required_error: "Konfirmasi kata sandi wajib diisi" })
      .min(6, "Konfirmasi kata sandi minimal 6 karakter"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

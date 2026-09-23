import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  sendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schema";

describe("lib/schemas/auth.schema", () => {
  it("validates correct login credentials", () => {
    const valid = loginSchema.safeParse({
      email: "candidate@stasrg.org",
      password: "password123",
    });
    expect(valid.success).toBe(true);
  });

  it("fails login on invalid email and short password", () => {
    const invalid = loginSchema.safeParse({
      email: "invalid-email",
      password: "123",
    });
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      const fieldErrors = invalid.error.flatten().fieldErrors;
      expect(fieldErrors.email).toBeDefined();
      expect(fieldErrors.password).toBeDefined();
    }
  });

  it("validates register data with OTP", () => {
    const valid = registerSchema.safeParse({
      email: "admin@stasrg.org",
      password: "securepassword",
      otp: "123456",
      role: "CANDIDATE",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.role).toBe("CANDIDATE");
      expect(valid.data.otp).toBe("123456");
    }
  });

  it("fails register data when OTP is missing or not 6 digits", () => {
    const missingOtp = registerSchema.safeParse({
      email: "admin@stasrg.org",
      password: "securepassword",
    });
    expect(missingOtp.success).toBe(false);

    const invalidOtp = registerSchema.safeParse({
      email: "admin@stasrg.org",
      password: "securepassword",
      otp: "12ab",
    });
    expect(invalidOtp.success).toBe(false);
  });

  it("validates sendOtpSchema with valid email and optional purpose", () => {
    const valid = sendOtpSchema.safeParse({
      email: "student@kampus.ac.id",
      purpose: "REGISTRATION",
    });
    expect(valid.success).toBe(true);
  });

  it("validates forgotPasswordSchema", () => {
    const valid = forgotPasswordSchema.safeParse({
      email: "student@kampus.ac.id",
    });
    expect(valid.success).toBe(true);

    const invalid = forgotPasswordSchema.safeParse({
      email: "invalid-email",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates resetPasswordSchema with matching passwords and 6-digit OTP", () => {
    const valid = resetPasswordSchema.safeParse({
      email: "student@kampus.ac.id",
      otp: "654321",
      newPassword: "newpassword123",
      confirmPassword: "newpassword123",
    });
    expect(valid.success).toBe(true);
  });

  it("fails resetPasswordSchema when passwords do not match", () => {
    const mismatch = resetPasswordSchema.safeParse({
      email: "student@kampus.ac.id",
      otp: "654321",
      newPassword: "newpassword123",
      confirmPassword: "differentpassword",
    });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      const fieldErrors = mismatch.error.flatten().fieldErrors;
      expect(fieldErrors.confirmPassword).toContain("Konfirmasi kata sandi tidak cocok");
    }
  });
});

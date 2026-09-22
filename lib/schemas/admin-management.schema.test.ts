import { describe, it, expect } from "vitest";
import {
  createAdminSchema,
  resetPasswordSchema,
} from "./admin-management.schema";

describe("lib/schemas/admin-management.schema", () => {
  describe("createAdminSchema", () => {
    it("validates valid admin data", () => {
      const valid = createAdminSchema.safeParse({
        email: "new.admin@stas-rg.ac.id",
        password: "PasswordKuat123!",
      });
      expect(valid.success).toBe(true);
    });

    it("fails when email is invalid", () => {
      const invalid = createAdminSchema.safeParse({
        email: "not-an-email",
        password: "PasswordKuat123!",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.flatten().fieldErrors.email).toBeDefined();
      }
    });

    it("fails when password is shorter than 8 characters", () => {
      const invalid = createAdminSchema.safeParse({
        email: "admin@stas-rg.ac.id",
        password: "short",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.flatten().fieldErrors.password).toBeDefined();
      }
    });
  });

  describe("resetPasswordSchema", () => {
    it("validates new password with 8 or more characters", () => {
      const valid = resetPasswordSchema.safeParse({
        newPassword: "NewSecretPassword2026!",
      });
      expect(valid.success).toBe(true);
    });

    it("fails when new password has less than 8 characters", () => {
      const invalid = resetPasswordSchema.safeParse({
        newPassword: "12345",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.flatten().fieldErrors.newPassword).toBeDefined();
      }
    });
  });
});

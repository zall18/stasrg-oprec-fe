import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "./auth.schema";

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

  it("validates register data", () => {
    const valid = registerSchema.safeParse({
      email: "admin@stasrg.org",
      password: "securepassword",
      role: "CANDIDATE",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.role).toBe("CANDIDATE");
    }
  });
});

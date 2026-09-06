import { describe, it, expect } from "vitest";
import {
  candidateProfileSchema,
  fileUploadSchema,
  MAX_FILE_SIZE,
} from "./candidate.schema";

describe("lib/schemas/candidate.schema", () => {
  it("validates a full candidate profile", () => {
    const validData = {
      fullName: "Alif Akbar",
      universitas: "Universitas Indonesia",
      nim: "102022530058",
      programStudi: "Sistem Informasi",
      roleInterest: "RISET" as const,
      cvUrl: "https://storage.stasrg.org/cv/alif.pdf",
      portfolioUrl: "https://github.com/alifakbar",
      transkripUrl: "https://storage.stasrg.org/transkrip/alif.pdf",
      ipk: 3.85,
      semester: 6,
      pengalaman: "Pengalaman riset AI dan Web dev.",
    };

    const result = candidateProfileSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails if portfolioUrl is not a valid URL", () => {
    const invalidData = {
      fullName: "Alif Akbar",
      universitas: "Universitas Indonesia",
      nim: "102022530058",
      programStudi: "Sistem Informasi",
      roleInterest: "RISET" as const,
      cvUrl: "https://storage.stasrg.org/cv/alif.pdf",
      portfolioUrl: "bukan-url-valid",
    };

    const result = candidateProfileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("validates PDF file upload under 5MB strictly", () => {
    const validFile = new File(["dummy content"], "cv.pdf", {
      type: "application/pdf",
    });
    const result = fileUploadSchema.safeParse(validFile);
    expect(result.success).toBe(true);
  });

  it("rejects non-PDF files", () => {
    const imageFile = new File(["dummy image"], "photo.png", {
      type: "image/png",
    });
    const result = fileUploadSchema.safeParse(imageFile);
    expect(result.success).toBe(false);
  });

  it("rejects PDF files exceeding 5MB", () => {
    const largeFile = new File(["x"], "huge.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(largeFile, "size", { value: MAX_FILE_SIZE + 1024 });
    const result = fileUploadSchema.safeParse(largeFile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("5MB");
    }
  });
});

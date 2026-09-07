import { describe, it, expect } from "vitest";
import {
  goldenApplicationSchema,
  goldenWizardStep1Schema,
  goldenWizardStep2Schema,
} from "./golden-application.schema";

describe("goldenApplicationSchema", () => {
  it("validates valid golden application", () => {
    const valid = {
      motivasi:
        "Saya memiliki ketertarikan mendalam pada riset sistem cerdas dan ingin mendedikasikan waktu di STAS-RG.",
      pencapaian: "Juara 1 Hackathon Nasional bidang AI 2025.",
      rekomendasi: "Dr. Budi Santoso (Dosen Pembimbing)",
    };
    const result = goldenApplicationSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("fails if motivasi is too short", () => {
    const invalid = {
      motivasi: "Tertarik",
      pencapaian: "Juara 1",
    };
    const result = goldenApplicationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates wizard step 1 academic data", () => {
    const step1 = {
      fullName: "Ahmad Fauzi",
      universitas: "Universitas Indonesia",
      nim: "12345678",
      programStudi: "Ilmu Komputer",
      semester: 5,
      ipk: 3.85,
      roleInterest: "RISET",
    };
    expect(goldenWizardStep1Schema.safeParse(step1).success).toBe(true);
  });

  it("validates wizard step 2 urls", () => {
    const step2 = {
      cvUrl: "https://drive.google.com/file/d/123/view",
      portfolioUrl: "https://github.com/ahmadfauzi",
      transkripUrl: "https://drive.google.com/file/d/456/view",
    };
    expect(goldenWizardStep2Schema.safeParse(step2).success).toBe(true);
  });
});

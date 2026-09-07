import { describe, it, expect } from "vitest";
import { batchSchema } from "./batch.schema";

describe("batchSchema", () => {
  it("validates correct batch input", () => {
    const valid = {
      name: "Batch 1 - 2026",
      description: "Pendaftaran Oprec STAS-RG Riset",
      startDate: "2026-09-01",
      endDate: "2026-09-30",
      quota: 40,
      isActive: true,
    };
    const result = batchSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("fails when name is shorter than 3 characters", () => {
    const invalid = {
      name: "B",
      quota: 10,
    };
    const result = batchSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("fails when quota is less than 1", () => {
    const invalid = {
      name: "Batch Riset",
      quota: 0,
    };
    const result = batchSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

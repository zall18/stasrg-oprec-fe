import { describe, it, expect } from "vitest";
import { noteSchema } from "./note.schema";

describe("noteSchema", () => {
  it("validates valid admin note", () => {
    const valid = {
      content: "Kandidat menunjukkan penguasaan Python dan PyTorch yang baik.",
      registrationId: "reg-123",
    };
    expect(noteSchema.safeParse(valid).success).toBe(true);
  });

  it("fails when note content is empty or too short", () => {
    const invalid = { content: "ab" };
    expect(noteSchema.safeParse(invalid).success).toBe(false);
  });
});

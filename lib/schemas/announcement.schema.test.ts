import { describe, it, expect } from "vitest";
import { announcementSchema } from "./announcement.schema";

describe("announcementSchema", () => {
  it("validates correct announcement", () => {
    const valid = {
      title: "Hasil Seleksi Berkas Batch 1",
      content:
        "Pengumuman kelulusan berkas sudah dapat diakses melalui portal kandidat.",
      isActive: true,
    };
    expect(announcementSchema.safeParse(valid).success).toBe(true);
  });

  it("fails when title is too short", () => {
    const invalid = {
      title: "Hi",
      content: "Pengumuman singkat",
    };
    expect(announcementSchema.safeParse(invalid).success).toBe(false);
  });
});

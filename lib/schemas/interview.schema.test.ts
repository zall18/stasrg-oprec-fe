import { describe, it, expect } from "vitest";
import { interviewSchema, rescheduleInterviewSchema } from "./interview.schema";

describe("interviewSchema", () => {
  it("validates online interview", () => {
    const valid = {
      candidateId: "user-uuid-1",
      datetime: "2026-10-15T09:00:00.000Z",
      type: "ONLINE",
      link: "https://meet.google.com/abc-defg-hij",
      notes: "Sesi tanya jawab teknis dan portofolio",
    };
    expect(interviewSchema.safeParse(valid).success).toBe(true);
  });

  it("validates offline interview without link", () => {
    const valid = {
      candidateId: "user-uuid-2",
      datetime: "2026-10-16T14:00:00.000Z",
      type: "OFFLINE",
      location: "Lab STAS-RG Lt. 3",
      notes: "Membawa laptop pribadi",
    };
    expect(interviewSchema.safeParse(valid).success).toBe(true);
  });

  it("fails when candidateId is missing", () => {
    const invalid = {
      datetime: "2026-10-15T09:00:00.000Z",
    };
    expect(interviewSchema.safeParse(invalid).success).toBe(false);
  });

  it("validates rescheduleInterviewSchema correctly", () => {
    const valid = {
      proposedDatetime: "2026-10-20T10:00:00.000Z",
      reason: "Ada jadwal praktikum mendadak pada jam tersebut.",
    };
    expect(rescheduleInterviewSchema.safeParse(valid).success).toBe(true);

    const invalid = {
      proposedDatetime: "",
      reason: "short",
    };
    expect(rescheduleInterviewSchema.safeParse(invalid).success).toBe(false);
  });
});

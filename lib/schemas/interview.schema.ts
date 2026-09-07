import { z } from "zod";

export const interviewSchema = z.object({
  candidateId: z.string().min(1, "Kandidat wajib dipilih"),
  registrationId: z.string().optional(),
  datetime: z.string().min(1, "Waktu wawancara wajib ditentukan"),
  type: z.enum(["ONLINE", "OFFLINE"]).default("ONLINE"),
  link: z
    .string()
    .url("Format tautan tidak valid (misal: https://meet.google.com/...)")
    .optional()
    .or(z.literal("")),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export type InterviewInput = z.infer<typeof interviewSchema>;

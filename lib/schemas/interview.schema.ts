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
  picName: z.string().optional(),
  picId: z.string().optional(),
});

export const rescheduleInterviewSchema = z.object({
  proposedDatetime: z
    .string({ required_error: "Usulan waktu baru wajib ditentukan" })
    .min(1, "Usulan waktu baru wajib ditentukan"),
  reason: z
    .string({ required_error: "Alasan reschedule wajib diisi" })
    .trim()
    .min(5, "Alasan minimal 5 karakter"),
});

export const adminRescheduleRejectSchema = z.object({
  adminNote: z
    .string({ required_error: "Catatan penolakan wajib diisi" })
    .trim()
    .min(5, "Catatan penolakan minimal 5 karakter"),
});

export type InterviewInput = z.infer<typeof interviewSchema>;
export type RescheduleInterviewInput = z.infer<typeof rescheduleInterviewSchema>;
export type AdminRescheduleRejectInput = z.infer<typeof adminRescheduleRejectSchema>;

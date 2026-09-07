import { z } from "zod";

export const noteSchema = z.object({
  content: z.string().min(3, "Catatan internal minimal 3 karakter"),
  registrationId: z.string().optional(),
});

export type NoteInput = z.infer<typeof noteSchema>;

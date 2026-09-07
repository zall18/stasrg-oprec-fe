import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().min(3, "Judul pengumuman minimal 3 karakter"),
  content: z.string().min(5, "Isi pengumuman minimal 5 karakter"),
  isActive: z.boolean().default(true),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;

import { z } from "zod";

export const batchSchema = z.object({
  name: z.string().min(3, "Nama batch minimal 3 karakter"),
  description: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  quota: z.coerce
    .number({ invalid_type_error: "Kuota harus berupa angka" })
    .int("Kuota harus bilangan bulat")
    .min(1, "Kuota minimal 1 kandidat")
    .default(30),
  isActive: z.boolean().default(false),
});

export type BatchInput = z.infer<typeof batchSchema>;

import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(8, "Nomor telepon tidak valid").optional().or(z.literal("")),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const bookingSchema = z.object({
  serviceId: z.string().min(1),
  psychologistId: z.string().optional(),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(8, "Nomor WhatsApp tidak valid"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Jam tidak valid"),
  mode: z.enum(["ONLINE", "OFFLINE"]),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional().or(z.literal("")),
  service: z.string().optional().or(z.literal("")),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
  type: z.enum(["contact"]).optional(),
});

export const moodSchema = z.object({
  mood: z.coerce.number().int().min(1).max(5),
  note: z.string().max(400).optional().or(z.literal("")),
});

export const articleSchema = z.object({
  title: z.string().min(4, "Judul minimal 4 karakter"),
  slug: z.string().min(3, "Slug wajib diisi"),
  category: z.string().min(2),
  excerpt: z.string().min(10, "Ringkasan minimal 10 karakter"),
  content: z.string().min(20, "Konten minimal 20 karakter"),
  cover: z
    .string()
    .refine(
      (value) => !value || /^(https?:\/\/|\/uploads\/)/.test(value),
      "URL cover tidak valid"
    )
    .optional()
    .or(z.literal("")),
  author: z.string().min(2),
  readMinutes: z.coerce.number().int().min(1).max(60).default(4),
  published: z.coerce.boolean().default(true),
});

export function fieldErrors(error: z.ZodError) {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

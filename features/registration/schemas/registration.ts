import { z } from "zod";

export const nikSchema = z
  .string()
  .min(16, "NIK harus 16 digit")
  .max(16, "NIK harus 16 digit")
  .regex(/^\d{16}$/, "NIK hanya boleh berisi angka");

export const registrationSchema = z
  .object({
    nik: nikSchema,
    namaLengkap: z
      .string()
      .min(2, "Nama lengkap minimal 2 karakter")
      .max(100, "Nama lengkap maksimal 100 karakter"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .max(128, "Password maksimal 128 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  nik: nikSchema,
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

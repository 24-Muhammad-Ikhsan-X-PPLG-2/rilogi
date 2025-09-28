import z from "zod";

export const formSchemeDaftar = z.object({
  email: z.email("Email tidak boleh kosong!"),
  username: z
    .string()
    .nonempty("Username tidak boleh kosong!")
    .min(6, "Username minimal 6 karakter!"),
  password: z
    .string()
    .nonempty("Password tidak boleh kosong!")
    .min(8, "Password minimal 8 karakter!")
    .regex(/[A-Za-z]/, "Password harus mengandung huruf")
    .regex(/\d/, "Password harus mengandung angka")
    .regex(/[^A-Za-z0-9]/, "Password harus mengandung simbol"),
});

export const formSchemeMasuk = z.object({
  email: z.email("Email tidak boleh kosong!"),
  password: z.string().nonempty("Password tidak boleh kosong!"),
});

export const formSchemeAddContact = z.object({
  rilo_id: z
    .string()
    .min(10, "Rilo id harus 10 digit!")
    .max(10, "Rilo id harus 10 digit!")
    .nonempty("Rilo id tidak boleh kosong!"),
  nama_kontak: z.string().nonempty("Nama kontak tidak boleh kosong!"),
});

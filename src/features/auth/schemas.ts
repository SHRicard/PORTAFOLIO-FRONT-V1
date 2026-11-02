import { z } from "zod";
import type { Sexo } from "./types";

/**
 * Validaciones de los formularios. Reflejan las reglas del backend (docs/api/LOGIN.md)
 * para avisar antes de enviar. El backend siempre vuelve a validar.
 */

export const SEXOS = ["masculino", "femenino", "otro", "prefiero_no_decir"] as const;

export const SEXO_LABELS: Record<Sexo, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  otro: "Otro",
  prefiero_no_decir: "Prefiero no decir",
};

const correo = z.string().trim().min(1, "El correo es obligatorio").pipe(z.email("Correo electrónico inválido"));

const perfil = {
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(60, "Máximo 60 caracteres"),
  apellido: z.string().trim().min(1, "El apellido es obligatorio").max(60, "Máximo 60 caracteres"),
  telefono: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{6,20}$/, "Teléfono inválido (solo números, espacios, - y paréntesis)"),
  pais: z.string().trim().min(2, "El país es obligatorio").max(60, "Máximo 60 caracteres"),
  sexo: z.enum(SEXOS, { message: "Elegí una opción" }),
  correo,
};

export const loginSchema = z.object({
  correo,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z
  .object({
    ...perfil,
    password: z.string().min(8, "Mínimo 8 caracteres").max(72, "Máximo 72 caracteres"),
    confirmarPassword: z.string().min(1, "Repetí la contraseña"),
  })
  .refine((d) => d.password === d.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

export const profileSchema = z.object(perfil);

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;

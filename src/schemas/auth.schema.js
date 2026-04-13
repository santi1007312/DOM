import { z } from 'zod';

export const loginSchema = z.object({
  document: z.string({
    required_error: "El documento es obligatorio",
    invalid_type_error: "El documento debe ser un texto",
  }).min(5, "El documento debe tener al menos 5 caracteres"),
}).strict("No se permiten campos adicionales en el inicio de sesión");
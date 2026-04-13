import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100).optional(),
  email: z.string().email("Formato de correo electrónico inválido").optional(),
  document: z.string().regex(/^\d+$/, "El documento solo puede contener números").optional(),
  role: z.enum(["user", "admin"], { 
    errorMap: () => ({ message: "El rol debe ser 'user' o 'admin'" }) 
  }).optional(),
  status: z.enum(["activo", "inactivo"], { 
    errorMap: () => ({ message: "El estado debe ser 'activo' o 'inactivo'" }) 
  }).optional()
}).strict("No se permiten campos adicionales en la actualización de usuario");

export const createUserSchema = z.object({
  name: z.string({ 
    required_error: "El nombre es obligatorio" 
  }).min(3, "El nombre debe tener al menos 3 caracteres").max(100),
  
  email: z.email("Formato de correo electrónico inválido"),

  document: z.string({ 
    required_error: "El documento es obligatorio" 
  }).regex(/^\d+$/, "El documento solo puede contener números, sin espacios ni letras"),
  
  role: z.enum(["user", "admin"], { 
    errorMap: () => ({ message: "El rol debe ser 'user' o 'admin'" }) 
  }).optional(),
  
  status: z.enum(["activo", "inactivo"], { 
    errorMap: () => ({ message: "El estado debe ser 'activo' o 'inactivo'" }) 
  }).optional()
}).strict("No se permiten campos adicionales en la creación de usuario");
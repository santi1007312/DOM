import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string({ 
    required_error: "El título es obligatorio" 
  }).min(5, "El título debe tener al menos 5 caracteres").max(100),
  description: z.string().max(500, "La descripción no puede exceder los 500 caracteres").optional(),
  userId: z.number({ 
    required_error: "El userId es obligatorio", 
    invalid_type_error: "El userId debe ser un número entero" 
  }).int().positive("El ID de usuario debe ser un número positivo")
}).strict();

export const updateTaskSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["pendiente", "en progreso", "completada"], {
      errorMap: () => ({ message: "Estado de tarea no válido" })
  }).optional()
}).strict();

export const assignTaskSchema = z.object({
  userIds: z.array(
    z.number({ 
      invalid_type_error: "Cada ID de usuario debe ser un número entero",
      required_error: "Se requiere un ID de usuario" 
    }).int().positive("Los IDs deben ser números positivos")
  ).min(1, "Debes enviar al menos un ID de usuario en el arreglo")
}).strict("No se permiten campos adicionales en la asignación");
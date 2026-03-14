import express from 'express';
import { 
  getTasks, getTaskById, createTask, updateTask, deleteTask,
  assignTaskToUsers, getTaskUsers, removeUserFromTask, filterTasks,
  patchTaskStatus, getDashboard // <-- IMPORTACIONES DE ISA
} from '../controllers/tasks.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const tasksRouter = express.Router();

// RUTA DE FER: Filtro de tareas (Solo Administradores)
// ¡Debe ir antes de router.get('/:id')!
tasksRouter.get('/filter', verifyToken, isAdmin, filterTasks);

// NUEVA RUTA DE ISA: Dashboard de Estadísticas (Solo Admin)
// Quedará en /api/tasks/dashboard
tasksRouter.get('/dashboard', verifyToken, isAdmin, getDashboard);

// TUS RUTAS CRUD
tasksRouter.get('/', verifyToken, isAdmin, getTasks); // <-- ISA: ¡Esta es la visualización global!
tasksRouter.post('/', verifyToken, isAdmin, createTask);
tasksRouter.get('/:id', verifyToken, getTaskById); 
tasksRouter.put('/:id', verifyToken, isAdmin, updateTask);
tasksRouter.delete('/:id', verifyToken, isAdmin, deleteTask);

// NUEVA RUTA DE ISA: Actualizar SOLO estado
// IMPORTANTE: NO usamos "isAdmin" aquí porque el Estudiante necesita cambiar 
// su estado de 'pendiente' a 'en progreso'.
tasksRouter.patch('/:id/status', verifyToken, patchTaskStatus);

// TUS RUTAS DE ASIGNACIÓN
tasksRouter.post('/:taskId/assign', verifyToken, isAdmin, assignTaskToUsers);
tasksRouter.get('/:taskId/users', verifyToken, isAdmin, getTaskUsers);
tasksRouter.delete('/:taskId/users/:userId', verifyToken, isAdmin, removeUserFromTask);

export default tasksRouter;
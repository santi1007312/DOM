import pool from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { successResponse } from '../utils/response.handler.js';

// 1. Obtener todas las tareas
export const getTasks = catchAsync(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM tasks');
  return successResponse(res, 200, "Tareas obtenidas correctamente", rows);
});

// 2. Obtener tarea por ID
export const getTaskById = catchAsync(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  
  if (rows.length === 0) {
    const error = new Error("Tarea no encontrada");
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }
  
  return successResponse(res, 200, "Tarea encontrada", rows[0]);
});

// 3. Crear Tarea (Soporte para múltiples estudiantes)
export const createTask = catchAsync(async (req, res) => {
  const { title, description, userIds } = req.body; 
  
  let tareasCreadas = 0;

  if (userIds && Array.isArray(userIds) && userIds.length > 0) {
    // Si mandaron un arreglo con varios estudiantes, creamos una tarea para cada uno
    for (const userId of userIds) {
      await pool.query(
        'INSERT INTO tasks (title, description, userId) VALUES (?, ?, ?)',
        [title, description, userId]
      );
      tareasCreadas++;
    }
  } else if (req.body.userId) {
    // Si mandaron un solo estudiante
    await pool.query(
      'INSERT INTO tasks (title, description, userId) VALUES (?, ?, ?)',
      [title, description, req.body.userId]
    );
    tareasCreadas = 1;
  } else {
    const error = new Error("Debes asignar la tarea a al menos un usuario");
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  return successResponse(res, 201, `Se asignaron ${tareasCreadas} tarea(s) exitosamente`);
});

// 4. Actualizar tarea (Profesor)
export const updateTask = catchAsync(async (req, res) => {
  const { title, description, status } = req.body;
  const [result] = await pool.query(
    'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?',
    [title, description, status || 'pendiente', req.params.id]
  );

  if (result.affectedRows === 0) {
    const error = new Error("Tarea no encontrada o sin cambios");
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }
  
  return successResponse(res, 200, "Tarea actualizada correctamente");
});

// 5. Eliminar tarea (Profesor)
export const deleteTask = catchAsync(async (req, res) => {
  const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
  
  if (result.affectedRows === 0) {
    const error = new Error("Tarea no encontrada");
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }
  
  return successResponse(res, 200, "Tarea eliminada definitivamente del sistema");
});

// 6. Cambiar Estado (Permite a los estudiantes actualizar su avance)
export const patchTaskStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  
  const [result] = await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
  
  if (result.affectedRows === 0) {
    const error = new Error("Tarea no encontrada");
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }
  
  return successResponse(res, 200, "Estado de la tarea actualizado");
});

// 7. Obtener tareas por usuario (Ruta específica)
export const getTasksByUser = catchAsync(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM tasks WHERE userId = ?', [req.params.userId]);
  return successResponse(res, 200, "Tareas del usuario obtenidas", rows);
});

// ==========================================
// RUTAS ADICIONALES Y DE GESTIÓN
// ==========================================

export const filterTasks = catchAsync(async (req, res) => {
  const { status } = req.query;
  const [rows] = await pool.query('SELECT * FROM tasks WHERE status = ?', [status]);
  return successResponse(res, 200, "Tareas filtradas", rows);
});

export const getDashboard = catchAsync(async (req, res) => {
  const [total] = await pool.query('SELECT COUNT(*) as count FROM tasks');
  const [pendientes] = await pool.query('SELECT COUNT(*) as count FROM tasks WHERE status = "pendiente"');
  const [completadas] = await pool.query('SELECT COUNT(*) as count FROM tasks WHERE status = "completada"');
  
  const dashboardData = {
    total: total[0].count,
    pendientes: pendientes[0].count,
    completadas: completadas[0].count
  };
  
  return successResponse(res, 200, "Métricas del dashboard obtenidas", dashboardData);
});

export const assignTaskToUsers = catchAsync(async (req, res) => {
  const { userIds } = req.body;
  const taskId = req.params.taskId;
  
  if (userIds && userIds.length > 0) {
    await pool.query('UPDATE tasks SET userId = ? WHERE id = ?', [userIds[0], taskId]);
  }
  return successResponse(res, 200, "Usuario asignado a la tarea");
});

export const getTaskUsers = catchAsync(async (req, res) => {
  const [task] = await pool.query('SELECT userId FROM tasks WHERE id = ?', [req.params.taskId]);
  
  if (task.length === 0 || !task[0].userId) {
    return successResponse(res, 200, "La tarea no tiene usuarios asignados", []);
  }
  
  const [users] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [task[0].userId]);
  return successResponse(res, 200, "Usuario de la tarea obtenido", users);
});

export const removeUserFromTask = catchAsync(async (req, res) => {
  await pool.query('UPDATE tasks SET userId = NULL WHERE id = ? AND userId = ?', [req.params.taskId, req.params.userId]);
  return successResponse(res, 200, "Usuario removido de la tarea");
});
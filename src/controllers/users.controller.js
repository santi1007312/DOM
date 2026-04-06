import pool from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { successResponse } from '../utils/response.handler.js';

export const getUsers = catchAsync(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM users');
  return successResponse(res, 200, "Usuarios obtenidos correctamente", rows);
});

export const getUserById = catchAsync(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
  
  if (rows.length === 0) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }
  
  return successResponse(res, 200, "Usuario encontrado", rows[0]);
});

export const createUser = catchAsync(async (req, res) => {
  const { name, email, document, role } = req.body;
  
  const [result] = await pool.query(
    'INSERT INTO users (name, email, document, role, status) VALUES (?, ?, ?, ?, ?)',
    [name, email, document, role || 'user', 'activo']
  );
  
  return successResponse(res, 201, "Usuario creado con éxito", { id: result.insertId });
});

export const updateUser = catchAsync(async (req, res) => {
  const { name, email, document, role, status } = req.body;
  
  const [result] = await pool.query(
    'UPDATE users SET name = ?, email = ?, document = ?, role = ?, status = ? WHERE id = ?',
    [name, email, document, role, status, req.params.id]
  );

  if (result.affectedRows === 0) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  return successResponse(res, 200, "Usuario actualizado correctamente");
});

export const deleteUser = catchAsync(async (req, res) => {
  const [result] = await pool.query("UPDATE users SET status = 'inactivo' WHERE id = ?", [req.params.id]);
  
  if (result.affectedRows === 0) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  return successResponse(res, 200, "Usuario desactivado correctamente");
});

export const patchUserStatus = catchAsync(async (req, res) => {
  const [result] = await pool.query('UPDATE users SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
  
  if (result.affectedRows === 0) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  return successResponse(res, 200, "Estado actualizado correctamente");
});
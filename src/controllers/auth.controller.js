import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync.js';
import { successResponse } from '../utils/response.handler.js';

export const login = catchAsync(async (req, res) => {
  const { document } = req.body;

  if (!document) {
    const error = new Error("El documento es obligatorio para iniciar sesión");
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  const [users] = await pool.query('SELECT * FROM users WHERE document = ?', [document]);

  if (users.length === 0) {
    const error = new Error("Usuario no encontrado en el sistema");
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  const user = users[0];
  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return successResponse(res, 200, "Inicio de sesión exitoso", {
    user: { id: user.id, name: user.name, role: user.role },
    token
  });
});
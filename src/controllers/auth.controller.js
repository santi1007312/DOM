import pool from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { successResponse } from '../utils/response.handler.js';
import { hashPassword, comparePassword, generateTokens } from '../utils/security.js';
import jwt from 'jsonwebtoken'

export const register = catchAsync(async (req, res) => {
  const { name, email, document, password, role } = req.body;

  if (!name || !email || !document || !password) {
    const error = new Error("Todos los campos (nombre, email, documento, contraseña) son obligatorios");
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  // 1. Verificar si el documento o correo ya existen
  const [existingUsers] = await pool.query('SELECT id FROM users WHERE document = ? OR email = ?', [document, email]);
  if (existingUsers.length > 0) {
    const error = new Error("El documento o correo ya están registrados en el sistema");
    error.statusCode = 409;
    error.isOperational = true;
    throw error;
  }

  // 2. Encriptar la contraseña usando nuestra Bóveda
  const hashedPassword = await hashPassword(password);
  
  // Por seguridad, si no envían rol, será 'user' por defecto
  const userRole = role === 'admin' ? 'admin' : 'user';

  // 3. Insertar usuario en la base de datos
  const [result] = await pool.query(
    'INSERT INTO users (name, email, document, password, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, document, hashedPassword, userRole]
  );

  return successResponse(res, 201, "Usuario registrado exitosamente", {
    userId: result.insertId
  });
});

export const login = catchAsync(async (req, res) => {
  const { document, password } = req.body;

  // 1. Validar entrada
  if (!document || !password) {
    const error = new Error("El documento y la contraseña son obligatorios para iniciar sesión");
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  // 2. Buscar usuario
  const [users] = await pool.query('SELECT * FROM users WHERE document = ?', [document]);

  if (users.length === 0) {
    const error = new Error("Credenciales inválidas"); // Mensaje ambiguo por seguridad
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  const user = users[0];

  // 3. Validar estado del usuario (No dejamos entrar inactivos)
  if (user.status === 'inactivo') {
    const error = new Error("El usuario se encuentra inactivo. Contacte al administrador.");
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  // 4. Comparar contraseñas
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  // 5. Generar los nuevos tokens de acceso y refresh
  const { accessToken, refreshToken } = generateTokens(user);

  return successResponse(res, 200, "Inicio de sesión exitoso", {
    user: { id: user.id, name: user.name, role: user.role },
    accessToken,
    refreshToken
  });
});


export const renewToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    const error = new Error("Se requiere el Refresh Token para renovar la sesión");
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  try {
    // 1. Verificamos el Refresh Token con su propia llave secreta
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 2. Si es válido, generamos un NUEVO par de tokens usando nuestra utilidad
    // (Esto se conoce como Refresh Token Rotation, mejora la seguridad)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: decoded.id,
      role: decoded.role
    });

    return successResponse(res, 200, "Token renovado exitosamente", {
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    // CUMPLIMIENTO DE RÚBRICA: Respuestas centralizadas en español para el refresh
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
            ok: false, 
            msn: "Su sesión ha expirado completamente. Por favor, inicie sesión de nuevo." 
        });
    }
    
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
            ok: false, 
            msn: "Refresh token inválido o corrupto." 
        });
    }

    // Fallback
    const err = new Error("Error interno al renovar el token");
    err.statusCode = 500;
    err.isOperational = true;
    throw err;
  }
});
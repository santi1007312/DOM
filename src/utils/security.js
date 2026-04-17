import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

/**
 * Encripta una contraseña en texto plano.
 */
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

/**
 * Compara una contraseña en texto plano con un hash de la base de datos.
 */
export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

/**
 * Genera el par de tokens (Access y Refresh) para el usuario.
 */
export const generateTokens = (user) => {
    // El payload solo lleva información no sensible
    const payload = { 
        id: user.id, 
        role: user.role 
    };

    // Token de acceso (Corta duración)
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });

    // Token de renovación (Larga duración)
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });

    return { accessToken, refreshToken };
};
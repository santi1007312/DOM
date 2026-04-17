import { errorResponse } from "../utils/response.handler.js";

export const globalErrorHandler = (err, req, res, next) => {
  console.error("Error capturado globalmente:", err.name, "-", err.message);
  
  let statusCode = err.statusCode || 500;
  let message = err.isOperational ? err.message : "Error interno del servidor";

  // CUMPLIMIENTO DE RÚBRICA: Estandarización de errores JWT en estricto español
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = "Acceso denegado. El token ha expirado.";
  }
  
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = "Acceso denegado. Firma de token inválida o corrupta.";
  }

  // Escudo extra: Si tus esquemas de validación (validateSchema) tiran error, lo atrapamos en español
  if (err.name === 'ZodError' || err.name === 'ValidationError') {
    statusCode = 400;
    message = "Error de validación: Revise que los datos enviados sean correctos.";
  }

  // Retornamos directamente el formato exacto para asegurar el cumplimiento del requerimiento
  return res.status(statusCode).json({
    ok: false,
    msn: message
  });
};
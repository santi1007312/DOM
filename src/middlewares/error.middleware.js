import { errorResponse } from "../utils/response.handler.js";

export const globalErrorHandler = (err, req, res, next) => {
  console.error("Error capturado globalmente:", err.message);
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Error interno del servidor";
  return errorResponse(res, statusCode, message, err.message);
};
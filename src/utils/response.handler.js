export const successResponse = (res, statusCode, message, data = []) => {
  return res.status(statusCode).json({ success: true, message, data, errors: [] });
};

export const errorResponse = (res, statusCode, message, errors = []) => {
  const formattedErrors = Array.isArray(errors) ? errors : [errors];
  return res.status(statusCode).json({ success: false, message, data: [], errors: formattedErrors });
};
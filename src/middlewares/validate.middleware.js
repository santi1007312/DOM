// Actualizamos el middleware para que acepte un "target" (body, query o params)
export const validateSchema = (schema, target = 'body') => {
  return (req, res, next) => {
    // Ahora intercepta req.body o req.query dependiendo de lo que le pidamos
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const structuredErrors = result.error.issues.map((issue) => {
        let finalMessage = issue.message;

        if (finalMessage.includes("received undefined")) {
          finalMessage = "Este parámetro es obligatorio";
        }

        return {
          field: issue.path.length > 0 ? issue.path[0] : target,
          message: finalMessage,
        };
      });

      const validationError = new Error(`Error de validación en los datos enviados por la URL (${target})`);
      validationError.statusCode = 400;
      validationError.errors = structuredErrors;

      return next(validationError);
    }

    // Sobreescribe los datos limpios y seguros
    req[target] = result.data;
    next();
  };
};
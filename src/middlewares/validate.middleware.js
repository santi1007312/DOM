export const validateSchema = (schema, target = 'body') => {
  return (req, res, next) => {
    // Valida dinámicamente según el objetivo (body o query)
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const structuredErrors = result.error.issues.map((issue) => {
        let finalMessage = issue.message;

        if (finalMessage.includes("received undefined")) {
          finalMessage = "Este campo es obligatorio";
        }

        return {
          field: issue.path.length > 0 ? issue.path[0] : target,
          message: finalMessage,
        };
      });

      // RESPUESTA DIRECTA (Cortamos el flujo aquí con un 400 limpio)
      return res.status(400).json({
        success: false,
        message: `Error de validación en: ${target}`,
        errors: structuredErrors
      });
    }

    // Inyectamos los datos ya validados y limpios
    req[target] = result.data;
    next();
  };
};
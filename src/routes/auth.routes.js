import express from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { loginSchema } from '../schemas/auth.schema.js';

const authRouter = express.Router();

// Ruta de registro (puedes agregarle un registerSchema después si lo deseas)
authRouter.post('/register', register);

// Ruta de login (mantenemos tu validación actual)
authRouter.post('/login', validateSchema(loginSchema), login);

authRouter.post('/refresh', renewToken);

export default authRouter;
import { globalErrorHandler } from './middlewares/error.middleware.js';
import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import './config/db.js'; 

import userRoutes from './routes/users.routes.js';
import taskRoutes from './routes/tasks.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. PRIMERO LAS RUTAS (Para que Express intente entrar aquí)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Ruta de bienvenida base
app.get('/', (req, res) => {
  res.status(200).json({ msn: "Servidor Express funcionando correctamente" });
}); 

// 2. LUEGO EL MANEJADOR 404 (Si no entró a ninguna de las de arriba, cae aquí)
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    msn: `La ruta ${req.method} ${req.url} no existe en este servidor`
  });
});

// 3. AL FINAL EL MIDDLEWARE GLOBAL DE ERRORES (Atrapa los throw new Error de los controladores)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
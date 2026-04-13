import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser, patchUserStatus } from '../controllers/users.controller.js';
import { getTasksByUser } from '../controllers/tasks.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
// CORRECCIÓN: Importación del middleware y el esquema
import { validateSchema } from '../middlewares/validate.middleware.js';
import { updateUserSchema } from '../schemas/user.schema.js';

const usersRouter = express.Router();

// RUTA DE FER: Ver mis tareas (Cualquier usuario logueado)
usersRouter.get('/:userId/tasks', verifyToken, getTasksByUser);

// CRUD DE USUARIOS (Solo Admin)
usersRouter.get('/', verifyToken, isAdmin, getUsers);
usersRouter.get('/:id', verifyToken, isAdmin, getUserById);
usersRouter.post('/', verifyToken, isAdmin, createUser);
// CORRECCIÓN: Se inyecta el middleware en el PUT
usersRouter.put('/:id', verifyToken, isAdmin, validateSchema(updateUserSchema), updateUser);
usersRouter.delete('/:id', verifyToken, isAdmin, deleteUser);
usersRouter.patch('/:id/status', verifyToken, isAdmin, patchUserStatus);

export default usersRouter;
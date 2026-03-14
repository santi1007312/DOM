# 📖 Documentación de Refactorización API (Backend v2.0)

Este documento detalla la reestructuración del Backend en Express (Capa Middleware) para cumplir con los requerimientos asignados a Ana Isabella (Isa), Fernando (Fer) y Andrés Santiago.

---

## 👩‍💻 1. Requerimientos de Ana Isabella (Isa)
**Enfoque:** Vistas generales y gestión directa de estados.

### A. Finalización/Actualización de Estado Directa
* **Endpoint:** `PATCH /api/tasks/:id/status`
* **Dónde está agregado:** * Controlador: `tasks.controller.js` (Función `patchTaskStatus`).
  * Rutas: `tasks.routes.js` (Línea 22 aprox).
* **Por qué y para qué:** Se separó del `PUT` general por seguridad. Permite a los *Estudiantes* cambiar el estado de su tarea (de `pendiente` a `en progreso`) sin darles acceso a modificar el título o la descripción de la tarea original.

### B. Visualización Global y Dashboard
* **Endpoint 1:** `GET /api/tasks` (Listado global).
* **Endpoint 2:** `GET /api/tasks/dashboard` (Métricas consolidadas).
* **Dónde está agregado:**
  * Controlador: `tasks.controller.js` (Funciones `getTasks` y `getDashboard`).
  * Rutas: `tasks.routes.js`.
* **Por qué y para qué:** `getTasks` es el motor principal para que el administrador vea el sistema. `getDashboard` fue una mejora añadida para enviar al frontend un resumen pre-calculado (estadísticas de tareas completadas vs pendientes) optimizando el rendimiento de la red.

---

## 👨‍💻 2. Requerimientos de Fernando (Fer)
**Enfoque:** Consultas específicas, parámetros y filtros relacionales.

### A. Filtrado de Tareas Dinámico
* **Endpoint:** `GET /api/tasks/filter?userId=X&status=Y`
* **Dónde está agregado:** * Controlador: `tasks.controller.js` (Función `filterTasks`).
  * Rutas: `tasks.routes.js` (IMPORTANTE: Mapeado antes de `/:id` para evitar colisiones de rutas).
* **Por qué y para qué:** Permite al panel del administrador cruzar datos fácilmente enviando `Query Parameters`. Evita traer toda la base de datos al frontend si solo queremos buscar las tareas "completadas" de un estudiante específico.

### B. Visualización de Tareas por Usuario Individual
* **Endpoint:** `GET /api/users/:userId/tasks`
* **Dónde está agregado:** * Controlador: `tasks.controller.js` (Función `getTasksByUser`).
  * Rutas: `users.routes.js` (Como es una consulta relativa al usuario, semánticamente pertenece al enrutador de usuarios).
* **Por qué y para qué:** Busca dentro del arreglo `userIds` de las tareas. Es el endpoint vital para el "Dashboard de Estudiante", garantizando que Ana solo vea las tareas de Ana.

---

## 🧑‍💻 3. Requerimientos de Andrés Santiago
**Enfoque:** Estructura Core, Autenticación (Login/Roles) y Asignación N:M.

### A. Módulo de Autenticación y Usuarios
* **Endpoints:** `POST /api/auth/login`, CRUD completo en `/api/users`.
* **Dónde está agregado:**
  * Controladores: `auth.controller.js` y `users.controller.js`.
  * Middleware: `auth.middleware.js` (`verifyToken`, `isAdmin`).
* **Por qué y para qué:** Transforma el backend de una API abierta a un sistema seguro. Introduce validación de Bearer Tokens simulados y Control de Acceso Basado en Roles (RBAC), impidiendo que estudiantes ejecuten métodos `DELETE` o `POST`.

### B. Asignación a Múltiples Usuarios
* **Endpoints:** `POST /api/tasks/:taskId/assign`, etc.
* **Dónde está agregado:**
  * Controlador: `tasks.controller.js` (Modificación de `createTask` para recibir `userIds: []`).
* **Por qué y para qué:** Rompe la limitación inicial de "1 tarea = 1 usuario". Ahora una tarea puede pertenecer a todo un grupo de trabajo, fundamental para la asignación masiva desde el nuevo Frontend.
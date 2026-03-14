const DB_URL = 'http://localhost:4000/tasks';
const USERS_DB_URL = 'http://localhost:4000/users';

const getTasks = async (req, res) => {
  try {
    const response = await fetch(DB_URL);
    res.status(200).json(await response.json());
  } catch (error) {
    res.status(500).json({ msn: "Error al obtener tareas" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const response = await fetch(`${DB_URL}/${req.params.id}`);
    if (!response.ok) return res.status(404).json({ msn: "Tarea no encontrada" });
    res.status(200).json(await response.json());
  } catch (error) {
    res.status(500).json({ msn: "Error al obtener la tarea" });
  }
};

const createTask = async (req, res) => {
  const { title, body, userIds } = req.body; 
  
  const newTask = {
    title,
    body,
    userIds: userIds || [], // Array de IDs
    status: "pendiente"
  };

  try {
    const response = await fetch(DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    });
    res.status(201).json({ msn: "Tarea creada", data: await response.json() });
  } catch (error) {
    res.status(500).json({ msn: "Error al crear tarea" });
  }
};

const updateTask = async (req, res) => {
  try {
    const response = await fetch(`${DB_URL}/${req.params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) {
      return res.status(404).json({ msn: "La tarea no existe" });
    }
    res.status(200).json({ msn: "Tarea actualizada", data: await response.json() });
  } catch (error) {
    res.status(500).json({ msn: "Error al actualizar tarea" });
  }
};

const deleteTask = async (req, res) => {
  try {
    await fetch(`${DB_URL}/${req.params.id}`, { method: 'DELETE' });
    res.status(200).json({ msn: "Tarea eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ msn: "Error al eliminar tarea" });
  }
};

// --- TUS ENDPOINTS DE ASIGNACIÓN MÚLTIPLE ---
const assignTaskToUsers = async (req, res) => {
  const { taskId } = req.params;
  const { userIds } = req.body; 

  try {
    const taskRes = await fetch(`${DB_URL}/${taskId}`);
    if (!taskRes.ok) return res.status(404).json({ msn: "Tarea no encontrada" });
    const task = await taskRes.json();

    const currentUsers = task.userIds || [];
    const updatedUserIds = [...new Set([...currentUsers, ...userIds])];

    const updateRes = await fetch(`${DB_URL}/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds: updatedUserIds })
    });

    res.status(200).json({ msn: "Usuarios asignados", data: await updateRes.json() });
  } catch (error) {
    res.status(500).json({ msn: "Error al asignar usuarios" });
  }
};

const getTaskUsers = async (req, res) => {
  const { taskId } = req.params;

  try {
    const taskRes = await fetch(`${DB_URL}/${taskId}`);
    if (!taskRes.ok) return res.status(404).json({ msn: "Tarea no encontrada" });
    const task = await taskRes.json();

    if (!task.userIds || task.userIds.length === 0) return res.status(200).json([]);

    const query = task.userIds.map(id => `id=${id}`).join('&');
    const usersRes = await fetch(`${USERS_DB_URL}?${query}`);
    
    res.status(200).json(await usersRes.json());
  } catch (error) {
    res.status(500).json({ msn: "Error al obtener usuarios asignados" });
  }
};

const removeUserFromTask = async (req, res) => {
  const { taskId, userId } = req.params;

  try {
    const taskRes = await fetch(`${DB_URL}/${taskId}`);
    if (!taskRes.ok) return res.status(404).json({ msn: "Tarea no encontrada" });
    const task = await taskRes.json();

    const updatedUserIds = (task.userIds || []).filter(id => String(id) !== String(userId));

    const updateRes = await fetch(`${DB_URL}/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds: updatedUserIds })
    });

    res.status(200).json({ msn: `Usuario removido`, data: await updateRes.json() });
  } catch (error) {
    res.status(500).json({ msn: "Error al remover usuario" });
  }
};

// --- REQUERIMIENTOS DE FERNANDO ---
const filterTasks = async (req, res) => {
  try {
    const { userId, status } = req.query; 
    
    const response = await fetch(DB_URL);
    let tasks = await response.json();

    if (userId) {
      tasks = tasks.filter(task => task.userIds && task.userIds.includes(String(userId)));
    }
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }

    res.status(200).json({ 
      msn: "Filtro aplicado", 
      cantidad: tasks.length, 
      data: tasks 
    });
  } catch (error) {
    res.status(500).json({ msn: "Error interno al filtrar las tareas" });
  }
};

const getTasksByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const response = await fetch(DB_URL);
    const allTasks = await response.json();

    const userTasks = allTasks.filter(task => task.userIds && task.userIds.includes(String(userId)));

    if (userTasks.length === 0) {
      return res.status(404).json({ msn: "Este usuario no tiene tareas asignadas" });
    }

    res.status(200).json(userTasks);
  } catch (error) {
    res.status(500).json({ msn: "Error al obtener las tareas del usuario" });
  }
};

// --- REQUERIMIENTOS DE ISA ---

// 1. Cambiar solo el estado de la tarea (PATCH)
const patchTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pendiente', 'en progreso', 'completada'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ msn: "Estado inválido. Use: pendiente, en progreso o completada" });
    }

    const response = await fetch(`${DB_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!response.ok) return res.status(404).json({ msn: "Tarea no encontrada" });
    
    res.status(200).json({ msn: "Estado actualizado", data: await response.json() });
  } catch (error) {
    res.status(500).json({ msn: "Error interno al actualizar estado" });
  }
};

// 2. Dashboard global opcional (GET)
const getDashboard = async (req, res) => {
  try {
    const [usersRes, tasksRes] = await Promise.all([
      fetch(USERS_DB_URL),
      fetch(DB_URL)
    ]);

    const users = await usersRes.json();
    const tasks = await tasksRes.json();

    // Filtramos solo los estudiantes (IDs del 1 al 9 según la lógica de tu frontend)
    const estudiantes = users.filter(u => Number(u.id) >= 1 && Number(u.id) <= 9);

    const resumen = {
      estadisticas: {
        totalEstudiantes: estudiantes.length,
        totalTareas: tasks.length,
        pendientes: tasks.filter(t => t.status === 'pendiente').length,
        enProgreso: tasks.filter(t => t.status === 'en progreso').length,
        completadas: tasks.filter(t => t.status === 'completada').length
      },
      usuarios: estudiantes,
      tareasGlobales: tasks
    };

    res.status(200).json(resumen);
  } catch (error) {
    res.status(500).json({ msn: "Error al generar el dashboard" });
  }
};

export {
  getTasks, getTaskById, createTask, updateTask, deleteTask,
  assignTaskToUsers, getTaskUsers, removeUserFromTask, filterTasks, getTasksByUser,
  patchTaskStatus, getDashboard
};
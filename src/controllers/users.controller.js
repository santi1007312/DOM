import pool from '../config/db.js'; // Importamos la conexión real

const DB_URL = 'http://localhost:4000/users'; // Mantener para las funciones de Fer

// RF03: Consultar todos los usuarios (ISA - REFACTORIZADO A MYSQL)
const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error en getUsers:", error.message);
    res.status(500).json({ msn: "Error al obtener usuarios de la base de datos" });
  }
};

// RF03: Consultar por ID (ISA - REFACTORIZADO A MYSQL)
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (rows.length === 0) return res.status(404).json({ msn: "Usuario no encontrado" });
    
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ msn: "Error al buscar el usuario en la base de datos" });
  }
};

// RF02: Crear usuario (FER - SIN REFACTORIZAR)
const createUser = async (req, res) => {
  const { name, email, document, role } = req.body;
  const newUser = { name, email, document, role: role || "user", status: "activo" };

  try {
    const response = await fetch(DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    res.status(201).json({ msn: "Usuario creado", data: await response.json() });
  } catch (error) {
    res.status(500).json({ msn: "Error al crear (Fer debe arreglar esto)" });
  }
};

// RF04: Actualizar usuario (FER - SIN REFACTORIZAR)
const updateUser = async (req, res) => {
  try {
    const response = await fetch(`${DB_URL}/${req.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.status(200).json({ msn: "Usuario actualizado", data: await response.json() });
  } catch (error) {
    res.status(500).json({ msn: "Error al actualizar (Fer debe arreglar esto)" });
  }
};

// RF05: Eliminar usuario (ISA - REFACTORIZADO A MYSQL)
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) return res.status(404).json({ msn: "El usuario no existe en la base de datos" });
    
    res.status(200).json({ msn: "Usuario eliminado correctamente de MySQL" });
  } catch (error) {
    res.status(500).json({ msn: "Error al eliminar de la base de datos" });
  }
};

const patchUserStatus = async (req, res) => {
  try {
    const response = await fetch(`${DB_URL}/${req.params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: req.body.status })
    });
    res.status(200).json({ msn: "Estado actualizado", data: await response.json() });
  } catch (error) {
    res.status(500).json({ msn: "Error al cambiar estado" });
  }
};

export { getUsers, getUserById, createUser, updateUser, deleteUser, patchUserStatus };
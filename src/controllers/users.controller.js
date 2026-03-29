import pool from '../config/db.js';

export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.status(200).json(rows);
  } catch (error) { res.status(500).json({ msn: "Error al obtener usuarios" }); }
};

export const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ msn: "Usuario no encontrado" });
    res.status(200).json(rows[0]);
  } catch (error) { res.status(500).json({ msn: "Error al buscar el usuario" }); }
};

export const createUser = async (req, res) => {
  const { name, email, document, role } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, document, role, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, document, role || 'user', 'activo']
    );
    res.status(201).json({ msn: "Usuario creado con éxito", id: result.insertId });
  } catch (error) { res.status(500).json({ msn: "Error al crear usuario" }); }
};

export const updateUser = async (req, res) => {
  // 1. Recibimos el status desde el frontend
  const { name, email, document, role, status } = req.body; 
  try {
    const [result] = await pool.query(
      // 2. Le decimos a MySQL que también actualice el status
      'UPDATE users SET name = ?, email = ?, document = ?, role = ?, status = ? WHERE id = ?',
      [name, email, document, role, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ msn: "Usuario no encontrado" });
    res.status(200).json({ msn: "Usuario actualizado" });
  } catch (error) { 
    res.status(500).json({ msn: "Error al actualizar" }); 
  }
};

// Borrado Lógico
export const deleteUser = async (req, res) => {
  try {
    const [result] = await pool.query("UPDATE users SET status = 'inactivo' WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ msn: "Usuario no encontrado" });
    res.status(200).json({ msn: "Usuario desactivado correctamente" });
  } catch (error) { res.status(500).json({ msn: "Error al desactivar" }); }
};

export const patchUserStatus = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE users SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ msn: "Usuario no encontrado" });
    res.status(200).json({ msn: "Estado actualizado" });
  } catch (error) { res.status(500).json({ msn: "Error al cambiar estado" }); }
};
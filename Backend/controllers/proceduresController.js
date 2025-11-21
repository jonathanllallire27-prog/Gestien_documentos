import pool from '../config/database.js';

export const getAllProcedures = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pr.*, p.nombre as persona_nombre, p.dni,
        COUNT(d.id) as documentos_count
      FROM procedures pr
      JOIN persons p ON pr.person_id = p.id
      LEFT JOIN documents d ON pr.id = d.procedure_id
      GROUP BY pr.id, p.nombre, p.dni
      ORDER BY pr.created_at DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener trámites:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getProceduresByPerson = async (req, res) => {
  try {
    const { personId } = req.params;

    const result = await pool.query(`
      SELECT pr.*, COUNT(d.id) as documentos_count
      FROM procedures pr
      LEFT JOIN documents d ON pr.id = d.procedure_id
      WHERE pr.person_id = $1
      GROUP BY pr.id
      ORDER BY pr.created_at DESC
    `, [personId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener trámites:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getProcedureById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT pr.*, p.nombre as persona_nombre, p.dni
      FROM procedures pr
      JOIN persons p ON pr.person_id = p.id
      WHERE pr.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener trámite:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createProcedure = async (req, res) => {
  try {
    const { person_id, tipo, descripcion, fecha_documento, responsable, estado } = req.body;

    if (!person_id || !tipo || !fecha_documento || !responsable) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });
    }

    const result = await pool.query(
      `INSERT INTO procedures (person_id, tipo, descripcion, fecha_documento, responsable, estado) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [person_id, tipo, descripcion, fecha_documento, responsable, estado || 'Pendiente']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear trámite:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateProcedure = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, descripcion, fecha_documento, responsable, estado } = req.body;

    const result = await pool.query(
      `UPDATE procedures 
       SET tipo = $1, descripcion = $2, fecha_documento = $3, responsable = $4, estado = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING *`,
      [tipo, descripcion, fecha_documento, responsable, estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar trámite:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteProcedure = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM procedures WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }

    res.json({ message: 'Trámite eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar trámite:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
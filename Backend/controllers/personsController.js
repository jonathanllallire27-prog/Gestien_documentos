import pool from '../config/database.js';

export const getAllPersons = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
        COUNT(DISTINCT pr.id) as tramites_count,
        COUNT(DISTINCT d.id) as documentos_count
      FROM persons p
      LEFT JOIN procedures pr ON p.id = pr.person_id
      LEFT JOIN documents d ON pr.id = d.procedure_id
      GROUP BY p.id
      ORDER BY p.nombre
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener personas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const searchPersons = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const result = await pool.query(`
      SELECT p.*, 
        COUNT(DISTINCT pr.id) as tramites_count,
        COUNT(DISTINCT d.id) as documentos_count
      FROM persons p
      LEFT JOIN procedures pr ON p.id = pr.person_id
      LEFT JOIN documents d ON pr.id = d.procedure_id
      WHERE p.nombre ILIKE $1 OR p.dni ILIKE $1
      GROUP BY p.id
      ORDER BY p.nombre
    `, [`%${q}%`]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al buscar personas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getPersonById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT p.*, 
        COUNT(DISTINCT pr.id) as tramites_count,
        COUNT(DISTINCT d.id) as documentos_count
      FROM persons p
      LEFT JOIN procedures pr ON p.id = pr.person_id
      LEFT JOIN documents d ON pr.id = d.procedure_id
      WHERE p.id = $1
      GROUP BY p.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener persona:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createPerson = async (req, res) => {
  try {
    const { nombre, dni, celular, direccion, correo } = req.body;

    if (!nombre || !dni) {
      return res.status(400).json({ error: 'Nombre y DNI son requeridos' });
    }

    const result = await pool.query(
      `INSERT INTO persons (nombre, dni, celular, direccion, correo) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [nombre, dni, celular, direccion, correo]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }
    console.error('Error al crear persona:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updatePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, dni, celular, direccion, correo } = req.body;

    const result = await pool.query(
      `UPDATE persons 
       SET nombre = $1, dni = $2, celular = $3, direccion = $4, correo = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING *`,
      [nombre, dni, celular, direccion, correo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }
    console.error('Error al actualizar persona:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deletePerson = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM persons WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    res.json({ message: 'Persona eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar persona:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
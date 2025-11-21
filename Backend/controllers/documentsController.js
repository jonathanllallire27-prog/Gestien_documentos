import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';

export const getDocumentsByProcedure = async (req, res) => {
  try {
    const { procedureId } = req.params;

    const result = await pool.query(
      'SELECT * FROM documents WHERE procedure_id = $1 ORDER BY fecha DESC',
      [procedureId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const { procedureId, fecha } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    if (!procedureId || !fecha) {
      // Eliminar el archivo subido si faltan datos
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'procedureId y fecha son requeridos' });
    }

    const result = await pool.query(
      `INSERT INTO documents (procedure_id, nombre, tipo, fecha, file_path) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [procedureId, file.originalname, file.mimetype, fecha, file.path]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al subir documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener información del documento
    const docResult = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const document = docResult.rows[0];

    // Eliminar el archivo físico
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Eliminar el registro de la base de datos
    await pool.query('DELETE FROM documents WHERE id = $1', [id]);

    res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const document = result.rows[0];

    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    res.download(document.file_path, document.nombre);
  } catch (error) {
    console.error('Error al descargar documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
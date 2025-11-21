import express from 'express';
import {
  getAllProcedures,
  getProceduresByPerson,
  getProcedureById,
  createProcedure,
  updateProcedure,
  deleteProcedure
} from '../controllers/proceduresController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/person/:personId', getProceduresByPerson);
router.get('/:id', getProcedureById);

// Rutas protegidas (solo admin)
router.get('/', authenticateToken, isAdmin, getAllProcedures);
router.post('/', authenticateToken, isAdmin, createProcedure);
router.put('/:id', authenticateToken, isAdmin, updateProcedure);
router.delete('/:id', authenticateToken, isAdmin, deleteProcedure);

export default router;
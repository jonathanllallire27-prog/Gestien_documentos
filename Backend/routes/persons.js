import express from 'express';
import {
  getAllPersons,
  searchPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson
} from '../controllers/personsController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Ruta pública para búsqueda
router.get('/search', searchPersons);

// Ruta pública para obtener persona por ID
router.get('/:id', getPersonById);

// Rutas protegidas (solo admin)
router.get('/', authenticateToken, isAdmin, getAllPersons);
router.post('/', authenticateToken, isAdmin, createPerson);
router.put('/:id', authenticateToken, isAdmin, updatePerson);
router.delete('/:id', authenticateToken, isAdmin, deletePerson);

export default router;
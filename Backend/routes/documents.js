import express from 'express';
import multer from 'multer';
import {
  getDocumentsByProcedure,
  uploadDocument,
  deleteDocument,
  downloadDocument
} from '../controllers/documentsController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Rutas públicas
router.get('/procedure/:procedureId', getDocumentsByProcedure);
router.get('/download/:id', downloadDocument);

// Rutas protegidas (solo admin)
router.post('/upload', authenticateToken, isAdmin, upload.single('file'), uploadDocument);
router.delete('/:id', authenticateToken, isAdmin, deleteDocument);

export default router;
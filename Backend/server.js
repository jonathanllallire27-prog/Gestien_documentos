import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './config/database.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import personsRoutes from './routes/persons.js';
import proceduresRoutes from './routes/procedures.js';
import documentsRoutes from './routes/documents.js';

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Para usar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Crear directorio de uploads si no existe
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/persons', personsRoutes);
app.use('/api/procedures', proceduresRoutes);
app.use('/api/documents', documentsRoutes);

// Ruta de bienvenida
app.get('/api', (req, res) => {
  res.json({ message: 'API del Sistema de Gestión de Trámites' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Inicializar base de datos
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
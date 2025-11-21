import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Función para inicializar la base de datos
export const initDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Crear tablas si no existen
    await client.query(`
      CREATE TABLE IF NOT EXISTS persons (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        dni VARCHAR(20) UNIQUE NOT NULL,
        celular VARCHAR(20),
        direccion TEXT,
        correo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS procedures (
        id SERIAL PRIMARY KEY,
        person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
        tipo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        fecha_documento DATE NOT NULL,
        responsable VARCHAR(255) NOT NULL,
        estado VARCHAR(50) DEFAULT 'Pendiente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        procedure_id INTEGER REFERENCES procedures(id) ON DELETE CASCADE,
        nombre VARCHAR(255) NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        fecha DATE NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Insertar admin por defecto si no existe
      INSERT INTO admin (username, password) 
      SELECT 'admin', '$2a$10$8K1p/a0dRL1//e12.5Ue9.E7M5.8cZb.8a8b8c8d8e8f' 
      WHERE NOT EXISTS (SELECT 1 FROM admin WHERE username = 'admin');

      -- Insertar datos de ejemplo
      INSERT INTO persons (nombre, dni, celular, direccion, correo) 
      SELECT 'Juan Pérez García', '12345678', '987654321', 'Av. Siempre Viva 123', 'juan@example.com'
      WHERE NOT EXISTS (SELECT 1 FROM persons WHERE dni = '12345678');

      INSERT INTO persons (nombre, dni, celular, direccion, correo) 
      SELECT 'María García López', '87654321', '912345678', 'Calle Falsa 123', 'maria@example.com'
      WHERE NOT EXISTS (SELECT 1 FROM persons WHERE dni = '87654321');

      INSERT INTO persons (nombre, dni, celular, direccion, correo) 
      SELECT 'Carlos Rodríguez Martínez', '11223344', '955666777', 'Jr. Libertad 456', 'carlos@example.com'
      WHERE NOT EXISTS (SELECT 1 FROM persons WHERE dni = '11223344');
    `);

    console.log('Base de datos inicializada correctamente');
    client.release();
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
};

export default pool;
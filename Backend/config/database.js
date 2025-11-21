import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export const initDatabase = async () => {
  try {
    // Verificar conexión
    await pool.query('SELECT NOW()');
    console.log('Conexión a la base de datos establecida.');

    // Crear tablas si no existen
    await pool.query(`
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

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar usuario por defecto si no existe
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (userResult.rows.length === 0) {
      // Importar bcrypt de forma dinámica
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123', 10);
      
      await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('Usuario admin creado (usuario: admin, contraseña: admin123)');
    }

    console.log('Base de datos inicializada correctamente.');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
};

export default pool;
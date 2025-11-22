import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Credenciales por defecto (en producción deberían estar en la base de datos)
const defaultAdmin = {
  username: 'admin',
  password: 'admin123' // En producción, esto debería estar hasheado
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Verificar credenciales (en producción, verificar contra la base de datos)
    if (username === defaultAdmin.username && password === defaultAdmin.password) {
      const token = jwt.sign(
        { 
          userId: 1, 
          username: defaultAdmin.username, 
          role: 'admin' 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: 1,
          username: defaultAdmin.username,
          role: 'admin'
        }
      });
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const verifyToken = (req, res) => {
  res.json({
    user: req.user,
    valid: true
  });
};
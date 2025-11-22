import React, { useState, useEffect } from 'react';
import PublicSearch from './components/PublicSearch';
import AdminModule from './components/AdminModule';
import { authAPI } from './services/api';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.verify();
          setIsAdmin(true);
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    setLoginError('');
    try {
      const response = await authAPI.login(credentials);
      
      // La respuesta ya es el objeto directo, no necesita .data
      const { token, user } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsAdmin(true);
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAdmin(false);
    setLoginError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAdmin ? (
        <AdminModule onLogout={handleLogout} />
      ) : (
        <PublicSearch 
          onAdminLogin={handleLogin} 
          loginError={loginError}
          setLoginError={setLoginError}
        />
      )}
    </div>
  );
}

export default App;
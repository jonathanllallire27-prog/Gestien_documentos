import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tu-dominio.com/api' 
  : 'http://localhost:5000/api';

// Configuración base de axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirigir al login si está en modo admin
      if (window.location.pathname !== '/') {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
};

// Servicios de personas
export const personsAPI = {
  getAll: () => api.get('/persons'),
  search: (query) => api.get(`/persons/search?q=${encodeURIComponent(query)}`),
  getById: (id) => api.get(`/persons/${id}`),
  create: (person) => api.post('/persons', person),
  update: (id, person) => api.put(`/persons/${id}`, person),
  delete: (id) => api.delete(`/persons/${id}`),
};

// Servicios de trámites
export const proceduresAPI = {
  getAll: () => api.get('/procedures'),
  getByPerson: (personId) => api.get(`/procedures/person/${personId}`),
  getById: (id) => api.get(`/procedures/${id}`),
  create: (procedure) => api.post('/procedures', procedure),
  update: (id, procedure) => api.put(`/procedures/${id}`, procedure),
  delete: (id) => api.delete(`/procedures/${id}`),
};

// Servicios de documentos
export const documentsAPI = {
  getByProcedure: (procedureId) => api.get(`/documents/procedure/${procedureId}`),
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),
  delete: (id) => api.delete(`/documents/${id}`),
  download: (id) => api.get(`/documents/download/${id}`, { 
    responseType: 'blob',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),
};

export default api;
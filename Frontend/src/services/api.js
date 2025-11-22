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
      if (window.location.pathname !== '/') {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// Función helper para extraer data
const handleResponse = (response) => response.data;

// Servicios de autenticación
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials).then(handleResponse),
  verify: () => api.get('/auth/verify').then(handleResponse),
};

// Servicios de personas
export const personsAPI = {
  getAll: () => api.get('/persons').then(handleResponse),
  search: (query) => api.get(`/persons/search?q=${encodeURIComponent(query)}`).then(handleResponse),
  getById: (id) => api.get(`/persons/${id}`).then(handleResponse),
  create: (person) => api.post('/persons', person).then(handleResponse),
  update: (id, person) => api.put(`/persons/${id}`, person).then(handleResponse),
  delete: (id) => api.delete(`/persons/${id}`).then(handleResponse),
};

// Servicios de trámites
export const proceduresAPI = {
  getAll: () => api.get('/procedures').then(handleResponse),
  getByPerson: (personId) => api.get(`/procedures/person/${personId}`).then(handleResponse),
  getById: (id) => api.get(`/procedures/${id}`).then(handleResponse),
  create: (procedure) => api.post('/procedures', procedure).then(handleResponse),
  update: (id, procedure) => api.put(`/procedures/${id}`, procedure).then(handleResponse),
  delete: (id) => api.delete(`/procedures/${id}`).then(handleResponse),
};

// Servicios de documentos
export const documentsAPI = {
  getByProcedure: (procedureId) => api.get(`/documents/procedure/${procedureId}`).then(handleResponse),
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 
      'Content-Type': 'multipart/form-data'
    }
  }).then(handleResponse),
  delete: (id) => api.delete(`/documents/${id}`).then(handleResponse),
  download: (id) => api.get(`/documents/download/${id}`, { 
    responseType: 'blob'
  }),
};

export default api;
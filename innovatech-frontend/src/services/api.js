import axios from 'axios';

// URL base del BFF - el frontend SOLO habla con el BFF, nunca directo a los microservicios
// En casa: puerto 8080, en el Duoc: puerto 8084
const BFF_URL = 'http://localhost:8084/api/bff';

// URL del microservicio de autenticación
// El login y registro van directo al ms-auth porque no necesitan pasar por el BFF
const AUTH_URL = 'http://localhost:8083/api/auth';

// Instancia de axios configurada para el BFF
// axios.create() crea un cliente HTTP con configuración predefinida
// Así no tenemos que escribir la URL completa en cada petición
const api = axios.create({ baseURL: BFF_URL });

// Interceptor: función que se ejecuta ANTES de cada petición HTTP
// Su trabajo es agregar el token JWT al header Authorization
// Sin esto, el backend rechazaría todas las peticiones con error 401
api.interceptors.request.use((config) => {
  // Busca el token JWT guardado cuando el usuario hizo login
  const token = localStorage.getItem('token');
  if (token) {
    // Formato estándar: "Bearer eyJhbGc..." 
    // El backend lee este header y verifica que el token sea válido
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Servicio de autenticación
// Usa axios directo (no la instancia "api") porque estas rutas son públicas
// No necesitan token JWT para funcionar
export const authService = {
  // POST /api/auth/register - crea un nuevo usuario en ms-auth
  // Recibe: { username, password, email, rol }
  register: (data) => axios.post(`${AUTH_URL}/register`, data),
  
  // POST /api/auth/login - verifica credenciales y retorna token JWT
  // Recibe: { username, password }
  // Retorna: { token, username, rol }
  login: (data) => axios.post(`${AUTH_URL}/login`, data),
};

// Servicio del dashboard
// Llama al BFF que internamente consulta proyectos Y recursos
// y los combina en una sola respuesta
export const dashboardService = {
  // GET /api/bff/dashboard - retorna estadísticas combinadas
  getDashboard: () => api.get('/dashboard'),
};

// Servicio de proyectos - CRUD completo
// Todas las peticiones pasan por el BFF (puerto 8084)
// El BFF las reenvía al ms-proyectos (puerto 8081)
export const proyectosService = {
  // GET /api/bff/proyectos - lista todos los proyectos
  getAll: () => api.get('/proyectos'),
  
  // POST /api/bff/proyectos - crea un nuevo proyecto
  // Recibe: { nombre, descripcion, estado, responsable, fechaInicio, fechaFin }
  create: (data) => api.post('/proyectos', data),
  
  // PUT /api/bff/proyectos/{id} - actualiza un proyecto existente
  update: (id, data) => api.put(`/proyectos/${id}`, data),
  
  // DELETE /api/bff/proyectos/{id} - elimina un proyecto
  delete: (id) => api.delete(`/proyectos/${id}`),
};

// Servicio de recursos humanos - CRUD completo
// El BFF las reenvía al ms-recursos (puerto 8082)
export const recursosService = {
  // GET /api/bff/recursos - lista todos los empleados
  getAll: () => api.get('/recursos'),
  
  // POST /api/bff/recursos - crea un nuevo empleado
  // Recibe: { nombre, apellido, email, cargo, departamento, disponibilidad, nivelExperiencia }
  create: (data) => api.post('/recursos', data),
  
  // PUT /api/bff/recursos/{id} - actualiza un empleado
  update: (id, data) => api.put(`/recursos/${id}`, data),
  
  // DELETE /api/bff/recursos/{id} - elimina un empleado
  delete: (id) => api.delete(`/recursos/${id}`),
};

export default api;
# 🎨 Innovatech Solutions — Frontend

Interfaz de usuario de la Plataforma Inteligente de Gestión de Proyectos y Recursos Humanos.

## 👥 Integrantes
- Matías Mercado
- Matías Bello

## 📋 Descripción
Aplicación frontend desarrollada en React que consume el BFF de Innovatech Solutions. Incluye autenticación JWT, control de roles, dashboard analítico y gestión completa de proyectos y recursos humanos.

## ✨ Características
- 🔐 Autenticación con JWT
- 👑 Control de roles (ADMIN/USER)
- 📊 Dashboard con estadísticas en tiempo real
- 📋 CRUD completo de proyectos
- 👥 CRUD completo de recursos humanos
- 🌙 Modo oscuro/claro
- 📱 Diseño responsive

## 🛠️ Tecnologías
- React 18
- React Router DOM
- Axios
- React Icons
- CSS-in-JS (estilos en línea)

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+
- npm

### Pasos

**1. Instalar dependencias:**
```bash
cd innovatech-frontend
npm install
```

**2. Iniciar la aplicación:**
```bash
npm start
```

**3. Abrir en el navegador:**
http://localhost:3000
> ⚠️ El backend debe estar corriendo antes de iniciar el frontend.

## 📁 Estructura del Proyecto
src/
├── components/
│   └── Navbar.js          # Barra de navegación con modo oscuro
├── pages/
│   ├── Login.js           # Página de inicio de sesión
│   ├── Register.js        # Página de registro
│   ├── Dashboard.js       # Dashboard con estadísticas
│   ├── Proyectos.js       # Gestión de proyectos
│   └── Recursos.js        # Gestión de recursos humanos
├── services/
│   └── api.js             # Servicios HTTP con Axios
└── App.js                 # Rutas y contexto del tema

## 🔐 Roles de Usuario
| Rol | Permisos |
|-----|----------|
| ADMIN | Ver, crear, editar y eliminar proyectos y empleados |
| USER | Solo visualización |

## 🌐 Conexión con el Backend
El frontend se conecta al BFF en:
- **Casa:** http://localhost:8080/api/bff
- **Duoc:** http://localhost:8084/api/bff
- **Autenticación:** http://localhost:8083/api/auth

## 🌿 Estrategia de Branching
Se utilizó **GitHub Flow**:
- `main` — rama principal con código estable
- `feature/frontend-matias-bello` — desarrollo del frontend

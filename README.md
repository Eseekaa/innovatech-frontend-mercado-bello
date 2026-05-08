# Innovatech Solutions - Frontend

Frontend de la Plataforma Inteligente de Gestion de Proyectos y Recursos Humanos.

La aplicacion esta desarrollada en React y consume el BFF del backend de Innovatech Solutions.

## Integrantes

- Matias Mercado
- Matias Bello

## Ubicacion de la app

El codigo React esta dentro de la carpeta:

```text
innovatech-frontend
```

Estructura principal:

```text
innovatech-frontend-mercado-bello
├── README.md
└── innovatech-frontend
    ├── public
    ├── src
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── README.md
```

## Funcionalidades

- Login y registro de usuarios.
- Autenticacion con JWT.
- Control visual de permisos por rol.
- Dashboard con resumen de proyectos, empleados y asignaciones.
- Gestion de proyectos.
- Gestion de recursos humanos.
- Asignacion de empleados a uno o mas proyectos.
- Visto bueno de proyectos y opcion para quitarlo.
- Modo claro/oscuro.
- Diseno responsivo para escritorio y celular.
- Soporte para Docker.

## Roles

| Rol | Permisos en la interfaz |
| --- | --- |
| USUARIO | Visualiza informacion y da/quita visto bueno |
| JEFE_PROYECTO | Crea/edita proyectos, crea/edita recursos y asigna empleados |
| ADMIN | Tiene acceso completo, incluyendo eliminar proyectos y recursos |

## Tecnologias

- React
- React Router DOM
- Axios
- React Icons
- CSS en `src/index.css`
- Docker
- nginx para publicar el build en contenedor

## Ejecucion recomendada con Docker

El Docker Compose principal esta en el repositorio backend. Para levantar todo el sistema se debe ejecutar desde:

```powershell
cd C:\Users\%USERNAME%\innovatech\innovatech-backend-mercado-bello
docker compose up --build
```

Luego abrir:

```text
http://localhost:3000
```

## Ejecucion manual

```powershell
cd C:\Users\Eseekaa\innovatech\innovatech-frontend-mercado-bello\innovatech-frontend
npm install
npm start
```

Abrir:

```text
http://localhost:3000
```

Importante: para usar la aplicacion completa, el backend debe estar corriendo.

## Conexion con backend

El frontend consume:

```text
Auth: http://localhost:8083/api/auth
BFF:  http://localhost:8084/api/bff
```

## Branching

Se uso GitHub Flow:

- `main`: version estable.
- `feature/frontend-matias-bello`: desarrollo del frontend.

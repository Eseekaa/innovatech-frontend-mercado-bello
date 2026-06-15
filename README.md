# Innovatech Solutions - Frontend

Frontend de la Plataforma Inteligente de Gestion de Proyectos, Recursos Humanos y Tareas para Innovatech Solutions.

La aplicacion esta desarrollada en React y consume el BFF del backend de Innovatech Solutions. Incluye autenticacion, control visual por roles, gestion de proyectos, gestion de recursos, gestion de tareas, dashboard con KPIs y soporte para modo claro/oscuro.

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
|-- README.md
`-- innovatech-frontend
    |-- public
    |-- src
    |-- Dockerfile
    |-- nginx.conf
    |-- package.json
    `-- README.md
```

## Funcionalidades

- Login y registro de usuarios.
- Autenticacion con JWT.
- Control visual de permisos por rol.
- Dashboard con resumen general y KPIs.
- Gestion de proyectos.
- Gestion de recursos humanos.
- Gestion de tareas por proyecto.
- Creacion, edicion y eliminacion de tareas segun rol.
- Asignacion de uno o mas responsables a cada tarea.
- Control de estado, prioridad, avance y visto bueno de cierre en tareas.
- Reportes KPI de tareas por estado, proyecto y responsable.
- Asignacion de empleados a uno o mas proyectos.
- Visto bueno de proyectos y opcion para quitarlo.
- Modo claro/oscuro.
- Interfaz visual renovada y responsiva para escritorio y celular.
- Soporte para Docker.

## Roles

| Rol | Permisos en la interfaz |
| --- | --- |
| USUARIO | Visualiza informacion, consulta tareas y participa en seguimiento |
| JEFE_PROYECTO | Crea/edita proyectos, recursos y tareas; asigna empleados y responsables |
| ADMIN | Tiene acceso completo, incluyendo eliminar proyectos, recursos y tareas |

## Tecnologias

- React
- React Router DOM
- Axios
- React Icons
- CSS modular y global
- Docker
- nginx para publicar el build en contenedor

## Ejecucion recomendada con Docker

El Docker Compose principal esta en el repositorio backend. Para levantar todo el sistema se debe ejecutar desde:

```powershell
cd C:\Users\%USERNAME%\innovatech\innovatech-backend-mercado-bello
docker compose up -d --build
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

El BFF centraliza la informacion de proyectos, recursos y tareas para que el frontend no tenga que comunicarse directamente con cada microservicio.

## Branching

Se uso GitHub Flow:

- `main`: version estable.
- `feature/frontend-matias-bello`: desarrollo inicial del frontend.
- `main`: integracion final EV3 de tareas, KPIs y renovacion visual.

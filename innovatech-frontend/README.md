# Innovatech Solutions - App React

Aplicacion web de Innovatech Solutions. Permite usar el sistema de gestion de proyectos y recursos humanos desde el navegador.

## Que incluye

- Pantalla de login.
- Pantalla de registro.
- Navbar con sesion activa, rol y cambio de tema.
- Dashboard con resumen general.
- Vista de proyectos.
- Vista de recursos humanos.
- Mensajes de exito y error.
- Diseno responsivo para escritorio y celular.

## Roles en frontend

El frontend lee el rol guardado despues del login y muestra acciones segun la jerarquia:

| Rol | Acciones |
| --- | --- |
| USUARIO | Ver informacion y dar/quitar visto bueno |
| JEFE_PROYECTO | Crear/editar proyectos y recursos, asignar empleados |
| ADMIN | Permisos completos, incluyendo eliminar |

## Estructura

```text
src
├── components
│   └── Navbar.js
├── pages
│   ├── Dashboard.js
│   ├── Login.js
│   ├── Proyectos.js
│   ├── Recursos.js
│   └── Register.js
├── services
│   └── api.js
├── App.js
└── index.css
```

## Variables importantes

En `src/services/api.js` se definen las URLs usadas por Axios:

```text
Auth: http://localhost:8083/api/auth
BFF:  http://localhost:8084/api/bff
```

## Ejecutar manualmente

```powershell
npm install
npm start
```

Abrir:

```text
http://localhost:3000
```

## Construir version de produccion

```powershell
npm run build
```

## Ejecutar con Docker

Normalmente no se ejecuta desde esta carpeta, sino desde el backend:

```powershell
cd C:\Users\%USERNAME%\innovatech\innovatech-backend-mercado-bello
docker compose up --build
```

Docker construye esta app y la publica con nginx en:

```text
http://localhost:3000
```

## Nota

El frontend depende del backend. Si el BFF o ms-auth no estan corriendo, login, dashboard, proyectos y recursos no podran cargar datos.

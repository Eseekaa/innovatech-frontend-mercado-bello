FROM node:20-alpine AS build
WORKDIR /app

# Instala dependencias del frontend.
# Usamos npm install para que Docker pueda resolver el lock aunque haya cambiado durante el desarrollo.
COPY package*.json ./
RUN npm install

# Construye la version estatica de React.
COPY . .
RUN npm run build

FROM nginx:1.27-alpine

# Configuracion SPA: cualquier ruta como /dashboard vuelve a index.html.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

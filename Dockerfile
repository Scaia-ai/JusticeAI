# ---------- STAGE 1: Construir la aplicación Angular ----------
    FROM node:18-alpine AS angular-build

    # Establece el directorio de trabajo
    WORKDIR /app
    
    # Copia el package.json y el package-lock.json de Angular
    COPY client/justiceAI/package*.json ./
    
    # Instala las dependencias de Angular
    RUN npm install
    
    # Copia el código fuente de Angular
    COPY client/justiceAI/ .
    
    # Construye la aplicación de Angular
    RUN npm run build --prod
    
    # ---------- STAGE 2: Configurar la aplicación Express ----------
    FROM node:18-alpine AS express-build
    
    # Establece el directorio de trabajo para Express
    WORKDIR /app
    
    # Copia el package.json y el package-lock.json de Express
    COPY server/package*.json ./
    
    # Instala las dependencias del servidor Express
    RUN npm install --production
    
    # Copia el código fuente de Express
    COPY server/ .
    
    # ---------- STAGE 3: Crear el contenedor final con Nginx para Angular y Node para Express ----------
    FROM node:18-alpine
    
    # Establece el directorio de trabajo final para el contenedor
    WORKDIR /app
    
    # Copia las dependencias de Angular construidas en el Stage 1 a una carpeta 'client' dentro de /app
    COPY --from=angular-build /app/dist /app/client
    
    # Copia el código y las dependencias del servidor Express desde el Stage 2
    COPY --from=express-build /app /app
    
    # Instala Nginx para servir la aplicación Angular
    RUN apk add --no-cache nginx
    
    # Copia un archivo de configuración básico para Nginx
    COPY nginx.conf /etc/nginx/nginx.conf
    
    # Exponer los puertos
    EXPOSE 80 3000
    
    # Comando para iniciar ambos servidores: Nginx para Angular y Express para el backend
    CMD ["sh", "-c", "nginx && node index.js"]
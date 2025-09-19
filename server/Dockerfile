# --- Etapa 1: Construcción de la imagen del servidor ---
# Usa una imagen base ligera de Node.js
FROM node:22-alpine AS builder

# Instala pnpm globalmente
RUN npm install -g pnpm

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de manifiesto para aprovechar el cache de Docker
COPY package.json pnpm-lock.yaml* ./

# Instala solo las dependencias de producción. Esto reduce el tamaño de la imagen final.
RUN pnpm install --prod --frozen-lockfile

# Copia el resto del código
COPY . .

# --- Etapa 2: Imagen final de ejecución (producción) ---
# Usa la misma imagen base, es ligera y ya tiene todo lo necesario
FROM node:22-alpine

# Crea un usuario no-root por seguridad
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Establece el directorio de trabajo
WORKDIR /app

# Copia las dependencias y el código desde la etapa de construcción
COPY --from=builder /app ./

# Cambia el propietario de los archivos al usuario no-root
RUN chown -R appuser:appgroup /app

# Expone el puerto que tu servidor usa
EXPOSE 4000

# Cambia al usuario no-root
USER appuser

# El comando para iniciar la aplicación en producción
CMD ["node", "index.js"]

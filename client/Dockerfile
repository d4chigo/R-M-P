FROM node:22-alpine

# Instalar pnpm globalmente
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando para desarrollo
CMD ["pnpm", "dev"]
# Stage 1: Build
FROM node:18-alpine AS builder

# Install pnpm globally.
RUN npm install -g pnpm

# Set the working directory to /app.
WORKDIR /app

# Copy pnpm manifest files.
COPY package.json pnpm-lock.yaml ./

# Install dependencies.
RUN pnpm install --frozen-lockfile

# Copy all source code.
COPY . .

# Pasa la variable de entorno del host al contexto de compilación
ARG NEXT_PUBLIC_API_URL

# Establece la variable de entorno para el proceso de compilación de Next.js
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Force the standalone output.
ENV NEXT_PRIVATE_STANDALONE=true

# Generate the production build.
RUN pnpm build

# Stage 2: Production
FROM node:18-alpine AS runner

# Set the working directory.
WORKDIR /app

# Configure a non-privileged user for security.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy the standalone build and the public directory.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static /app/.next/static

# Define the port the app will listen on.
ENV PORT 3000
EXPOSE 3000

# Start the production server.
CMD ["node", "server.js"]

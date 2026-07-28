# Multi-Stage Production Dockerfile for Project Atlas Universal Knowledge Engine

# Stage 1: Build Phase
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json ./

# Install dependencies (including devDependencies needed for Vite/esbuild compilation)
RUN npm install

# Copy source code
COPY . .

# Build production bundle (client SPA + compiled Node.js server.cjs)
RUN npm run build

# Stage 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Security: Run as non-root user
USER node

# Copy compiled assets and server bundle from builder
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

# Expose production port
EXPOSE 3000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

# Start server
CMD ["node", "dist/server.cjs"]

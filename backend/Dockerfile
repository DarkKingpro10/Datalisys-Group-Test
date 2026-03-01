# ---------- Dependencias ----------
FROM node:20-bookworm-slim AS deps

WORKDIR /app

# Habilitar pnpm
RUN corepack enable

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# ---------- Build ----------
FROM node:20-bookworm-slim AS build

WORKDIR /app
RUN corepack enable

# Copiar node_modules desde deps
COPY --from=deps /app/node_modules ./node_modules

# Copiar todo el código
COPY . .

# Generar cliente Prisma
RUN pnpm prisma generate

# Compilar TypeScript
RUN pnpm build

# ---------- Producción ----------
FROM node:20-bookworm-slim AS prod

WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable

# Copiamos solo lo necesario
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Copiando los archivos de generación de Prisma
COPY --from=build /app/generated ./generated

EXPOSE 8000

CMD ["pnpm", "start"]
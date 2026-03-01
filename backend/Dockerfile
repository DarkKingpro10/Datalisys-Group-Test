FROM node:24.14.0-bookworm-slim
# Actualiza el sistema base y limpia caché
RUN apt-get update \
	&& apt-get upgrade -y \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
# Activa corepack para soporte nativo de pnpm
RUN corepack enable

# Copia los archivos de dependencias primero
COPY package.json pnpm-lock.yaml ./

# Instala dependencias con pnpm
RUN pnpm install --frozen-lockfile

# Copia el resto del código fuente
COPY . .

# Genera el cliente de Prisma y corre migraciones
RUN pnpm prisma generate && pnpm prisma migrate deploy

EXPOSE 8000

CMD ["pnpm", "start"]

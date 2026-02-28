FROM node:24.14.0-bookworm-slim

WORKDIR /usr/src/app

# Copia package.json y package-lock.json primero para cachear npm install
COPY package*.json ./

# Se usa Node.js LTS pineado a 24.14.0 y se aplica actualización segura del sistema base.
RUN apt-get update \
  && apt-get upgrade -y \
  && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD ["node", "--version"]

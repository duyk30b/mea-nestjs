FROM node:16.18.1-alpine3.15 AS local
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . .

FROM node:16.18.1-alpine3.15 AS production
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install --production --silent
COPY [".env", ".env.production", "tsconfig.json", "nest-cli.json", "./"]
COPY ./assets ./assets
COPY ./apps ./apps

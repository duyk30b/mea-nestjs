FROM node:20.14.0-alpine AS local
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . .

FROM node:20.14.0-alpine AS production
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install --production --silent
COPY [".env", ".env.production", "tsconfig.json", "nest-cli.json", "./"]
COPY ./assets ./assets
COPY ./apps ./apps
COPY ./dist ./dist

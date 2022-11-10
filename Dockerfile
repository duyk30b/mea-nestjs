FROM node:16.18.1-alpine3.15 AS development
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . .

FROM node:16.18.1-alpine3.15 AS staging
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install --production --silent
COPY [".env", ".env.staging", "tsconfig.json", "./"]
COPY ./dist ./dist
COPY ./libs ./libs

FROM node:16.18.1-alpine3.15 AS production
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install --production --silent
COPY [".env", ".env.production", "tsconfig.json", "./"]
COPY ./dist ./dist
COPY ./libs ./libs

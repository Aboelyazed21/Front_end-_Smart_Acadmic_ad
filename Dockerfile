# syntax=docker/dockerfile:1
# Standalone image: build context is this folder (Desktop/فرنت).
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
# nginx:alpine runs envsubst on /etc/nginx/templates/*.template at startup.
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV API_UPSTREAM=http://backend-api:4000
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1

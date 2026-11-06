FROM node:24-alpine AS build

WORKDIR /app

COPY farma-frontend/package*.json ./
RUN npm ci

COPY farma-frontend/ ./
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/www /usr/share/nginx/html

EXPOSE 80

# ---------- Etapa 1: build ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_GRAPHQL_URL se inyecta en build (las vars VITE_* se resuelven en build time)
ARG VITE_GRAPHQL_URL=http://localhost:3000/graphql
ENV VITE_GRAPHQL_URL=$VITE_GRAPHQL_URL

RUN npm run build

# ---------- Etapa 2: servir estáticos ----------
FROM nginx:1.27-alpine AS runtime

# Config SPA: redirige todas las rutas a index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

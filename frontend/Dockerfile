# Estágio 1: Build do Frontend React com Vite
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte e compilar
COPY . .
RUN npm run build

# Estágio 2: Servidor Nginx de Produção
FROM nginx:alpine

# Copiar build estático do React
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx com proxy reverso para a API
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


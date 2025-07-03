# Etapa de build
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm ci
RUN cd server && npm ci

COPY . .

RUN npm run build

# Executa init-db durante build
RUN cd server && npm run init-db

# Etapa de produção
FROM node:18-alpine

RUN npm install -g serve

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

RUN mkdir -p ./server/database

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["npm", "start", "--prefix", "server"]
# Use Node.js 18 LTS
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm ci
RUN cd server && npm ci

COPY . .

RUN npm run build

# Production stage
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

# ✔️ Porta corrigida para 3000
EXPOSE 3000

CMD ["sh", "-c", "cd server && npm run init-db && npm start"]

# ========================================================
# ETAPA 1: Construção e Compilação (Builder)
# ========================================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --production

# ========================================================
# ETAPA 2: Ambiente de Execução de Produção (Runner)
# ========================================================
FROM node:20-alpine AS runner

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]

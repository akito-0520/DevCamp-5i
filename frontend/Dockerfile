# 依存解決
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ビルド
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build      # → build/server/index.js 等が生成

# 実行（本番）
FROM node:20-alpine AS runner
WORKDIR /app
# runtime 依存のみでOK（@react-router/serve は "dependencies" にある）
COPY package*.json ./
RUN npm ci --omit=dev
# サーバー/クライアント成果物を配置
COPY --from=build /app/build ./build
# Cloud Run 要件
ENV NODE_ENV=production
ENV HOST=0.0.0.0
EXPOSE 8080
CMD ["npm","run","start"]   # "start": "react-router-serve ./build/server/index.js"
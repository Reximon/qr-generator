FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN npm install -g nodemon
COPY . .
CMD ["npm", "run", "dev"]

FROM node:20-slim AS production
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY public ./public
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -s http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]

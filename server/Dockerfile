# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "-r", "./dist/middleware/observability/tracing.js", "dist/server.js"]

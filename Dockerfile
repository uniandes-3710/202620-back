# ---- Build ----
FROM node:24-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

# ---- Runtime ----
FROM node:24-slim
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    DB_PATH=/app/data/app.sqlite \
    UPLOADS_DIR=/app/uploads

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Carpetas de la base SQLite y de las imágenes subidas; se montan como volúmenes para persistir
RUN mkdir -p /app/data /app/uploads && chown node:node /app/data /app/uploads
USER node
VOLUME ["/app/data", "/app/uploads"]

EXPOSE 8080
CMD ["node", "dist/main"]

#
# Single-container build: React UI (static) + Node API
#

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY services/api/package.json services/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build -w @weather/web
RUN npm run build -w @weather/api

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/services/api/dist ./services/api/dist
COPY --from=build /app/services/api/package.json ./services/api/package.json
COPY --from=build /app/apps/web/dist ./apps/web/dist

ENV PORT=3000
ENV PUBLIC_BASE_URL=http://localhost:3000
ENV WEB_DIST_DIR=/app/apps/web/dist
EXPOSE 3000

CMD ["node", "services/api/dist/server.js"]


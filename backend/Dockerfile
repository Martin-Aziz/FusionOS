FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/package.json
RUN npm install

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S trios && adduser -S trios -G trios
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/common ./common
USER trios
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -q -O /dev/null http://localhost:4000/health || exit 1
CMD ["node", "backend/dist/backend/src/server.js"]

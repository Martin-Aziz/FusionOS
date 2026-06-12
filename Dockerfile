# ---------- stage 1: build frontend ----------
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm install

COPY common ./common
COPY frontend ./frontend
RUN npm --workspace frontend run build

# ---------- stage 2: build Rust backend ----------
FROM rust:1.78-slim AS rust-build
WORKDIR /app

# Cache dependencies first
COPY backend-rust/Cargo.toml backend-rust/Cargo.lock* ./backend-rust/
COPY common/data ./common/data
RUN mkdir -p backend-rust/src && echo "fn main(){}" > backend-rust/src/main.rs
RUN cd backend-rust && cargo build --release 2>/dev/null; rm -f target/release/fusionos-backend

# Build the real binary
COPY backend-rust ./backend-rust
RUN cd backend-rust && cargo build --release

# ---------- stage 3: runtime ----------
FROM debian:bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

RUN addgroup --system fusionos && adduser --system --ingroup fusionos fusionos

COPY --from=rust-build /app/backend-rust/target/release/fusionos-backend ./fusionos-backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

USER fusionos
EXPOSE 4000

ENV NODE_ENV=production
ENV FRONTEND_DIST_PATH=/app/frontend/dist

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["./fusionos-backend"]

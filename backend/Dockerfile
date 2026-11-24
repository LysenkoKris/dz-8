FROM oven/bun:1
WORKDIR /app
COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile
COPY backend/ .
COPY certs/server/server.crt /certs/server.crt
COPY certs/server/server.key /certs/server.key
ENV CERT_KEY_PATH=/certs/server.key
ENV CERT_CERT_PATH=/certs/server.crt
EXPOSE 80 443
CMD ["sh", "-c", "bun run migrate && bun src/index.ts"]

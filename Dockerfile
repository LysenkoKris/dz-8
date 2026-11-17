FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY certs/server/server.crt /etc/nginx/certs/server.crt
COPY certs/server/server.key /etc/nginx/certs/server.key
EXPOSE 80 443

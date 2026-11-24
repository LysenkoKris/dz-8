# Домашнее задание 8 + 9

Сервис управления пользователями: фронт + бэкенд в одной репе.

- фронт: React, TypeScript, Bun, Nanostores, Axios, TanStack Form
- бэкенд: Bun, TypeScript, PostgreSQL (`backend/`)
- код подтверждения: `123456`

```bash
bun install
bun install --cwd backend
./certs/generate.sh
```

Локально (два терминала):

```bash
docker compose up -d db
bun run migrate
bun run dev:api
```

```bash
bun run dev
```

Фронт: `https://localhost:5173` (проксирует `/api` на бэкенд)  
API: `http://localhost:8000` / `https://localhost:8443`

Всё в Docker:

```bash
./certs/generate.sh
docker compose up --build -d
```

Web: `https://localhost`  
API: `http://localhost:8000` / `https://localhost:8443`  
Postgres: `localhost:5432`

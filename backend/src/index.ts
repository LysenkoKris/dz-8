import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { error, withCors } from "./lib/http";
import { handleAuth } from "./routes/auth";
import { handleMe } from "./routes/me";

const httpPort = Number(process.env.HTTP_PORT ?? 8000);
const httpsPort = Number(process.env.HTTPS_PORT ?? 8443);

const keyPath =
  process.env.CERT_KEY_PATH ??
  resolve(import.meta.dirname, "../../certs/server/server.key");
const certPath =
  process.env.CERT_CERT_PATH ??
  resolve(import.meta.dirname, "../../certs/server/server.crt");
const hasCerts = existsSync(keyPath) && existsSync(certPath);

async function router(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return withCors(new Response(null, { status: 204 }));
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/health" && request.method === "GET") {
    return withCors(Response.json({ ok: true }));
  }

  const authResponse = await handleAuth(request, path);
  if (authResponse) return withCors(authResponse);

  const meResponse = await handleMe(request, path);
  if (meResponse) return withCors(meResponse);

  return withCors(error("Not found", 404));
}

Bun.serve({
  port: httpPort,
  fetch: router,
});

console.log(`HTTP  http://localhost:${httpPort}`);

if (hasCerts) {
  Bun.serve({
    port: httpsPort,
    tls: {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath),
    },
    fetch: router,
  });
  console.log(`HTTPS https://localhost:${httpsPort}`);
} else {
  console.log("HTTPS skipped: generate certs with ./certs/generate.sh");
}

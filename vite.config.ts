import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const keyPath = path.resolve(import.meta.dirname, "certs/server/server.key");
const certPath = path.resolve(import.meta.dirname, "certs/server/server.crt");
const https =
  fs.existsSync(keyPath) && fs.existsSync(certPath)
    ? {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    : undefined;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    https,
  },
  preview: {
    port: 4173,
    https,
  },
});

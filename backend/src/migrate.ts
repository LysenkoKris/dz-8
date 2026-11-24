import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sql } from "./db";

const schemaPath = resolve(import.meta.dirname, "../sql/schema.sql");
const schema = readFileSync(schemaPath, "utf8");

await sql.unsafe(schema);
console.log("Migration applied:", schemaPath);
await sql.end();

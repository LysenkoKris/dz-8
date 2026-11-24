import postgres from "postgres";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://dz8:dz8@localhost:5432/dz8";

export const sql = postgres(databaseUrl, {
  max: 10,
});

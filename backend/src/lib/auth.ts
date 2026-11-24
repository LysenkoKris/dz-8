import { sql } from "../db";
import type { UserRow } from "../types";
import { error, getBearerToken } from "./http";

export async function requireUser(
  request: Request,
): Promise<{ user: UserRow; token: string } | Response> {
  const token = getBearerToken(request);
  if (!token) return error("Требуется авторизация", 401);

  const rows = await sql<UserRow[]>`
    SELECT u.*
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token}
    LIMIT 1
  `;

  const user = rows[0];
  if (!user) return error("Сессия недействительна", 401);
  return { user, token };
}

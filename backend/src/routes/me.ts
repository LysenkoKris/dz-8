import { sql } from "../db";
import { requireUser } from "../lib/auth";
import { error, json, readJson } from "../lib/http";
import { formatPhone, isCompletePhone, phoneDigits } from "../lib/phone";
import { hashPassword, verifyPassword } from "../lib/password";
import { toPublicUser } from "../lib/user";
import type { ChangePasswordBody, UpdateProfileBody, UserRow } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function handleMe(request: Request, path: string): Promise<Response | null> {
  if (path === "/api/me" && request.method === "GET") {
    return getMe(request);
  }
  if (path === "/api/me" && request.method === "PUT") {
    return updateMe(request);
  }
  if (path === "/api/me/password" && request.method === "PUT") {
    return changePassword(request);
  }
  return null;
}

async function getMe(request: Request): Promise<Response> {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;
  return json({ user: toPublicUser(auth.user) });
}

async function updateMe(request: Request): Promise<Response> {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  const body = await readJson<UpdateProfileBody>(request);
  if (!body) return error("Некорректный JSON");
  if (!body.name?.trim() || !body.email?.trim() || !body.phone?.trim()) {
    return error("Заполните все поля");
  }

  const name = body.name.trim();
  const email = body.email.trim().toLowerCase();
  const phone = formatPhone(body.phone);
  const digits = phoneDigits(phone);

  if (name.length < 2) return error("Имя должно быть не короче 2 символов");
  if (!EMAIL_RE.test(email)) return error("Некорректный email");
  if (!isCompletePhone(phone)) return error("Телефон в формате +7 (___) ___-__-__");

  const conflict = await sql`
    SELECT 1 FROM users
    WHERE id <> ${auth.user.id}
      AND (email = ${email} OR phone_digits = ${digits})
    LIMIT 1
  `;
  if (conflict.length > 0) {
    return error("Email или телефон уже заняты", 409);
  }

  const rows = await sql<UserRow[]>`
    UPDATE users
    SET name = ${name}, email = ${email}, phone = ${phone}, phone_digits = ${digits}
    WHERE id = ${auth.user.id}
    RETURNING *
  `;
  const user = rows[0];
  if (!user) return error("Пользователь не найден", 404);
  return json({ user: toPublicUser(user) });
}

async function changePassword(request: Request): Promise<Response> {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  const body = await readJson<ChangePasswordBody>(request);
  if (!body) return error("Некорректный JSON");

  if (!(await verifyPassword(body.currentPassword ?? "", auth.user.password_hash))) {
    return error("Текущий пароль неверен", 403);
  }
  if (!body.newPassword || body.newPassword.length < 6) {
    return error("Новый пароль должен быть не короче 6 символов");
  }

  const passwordHash = await hashPassword(body.newPassword);
  await sql`
    UPDATE users SET password_hash = ${passwordHash} WHERE id = ${auth.user.id}
  `;
  return json({ ok: true });
}

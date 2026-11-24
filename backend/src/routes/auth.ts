import { sql } from "../db";
import { getBearerToken, error, json, readJson } from "../lib/http";
import { formatPhone, isCompletePhone, phoneDigits } from "../lib/phone";
import { hashPassword, verifyPassword } from "../lib/password";
import { toPublicUser } from "../lib/user";
import type {
  LoginBody,
  RegisterBody,
  UserRow,
  VerificationChannel,
  VerifyBody,
} from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_CODE = process.env.VERIFICATION_CODE ?? "123456";

function isChannel(value: unknown): value is VerificationChannel {
  return value === "email" || value === "phone";
}

export async function handleAuth(request: Request, path: string): Promise<Response | null> {
  if (path === "/api/auth/register" && request.method === "POST") {
    return register(request);
  }
  if (path === "/api/auth/verify" && request.method === "POST") {
    return verify(request);
  }
  if (path === "/api/auth/login" && request.method === "POST") {
    return login(request);
  }
  if (path === "/api/auth/logout" && request.method === "POST") {
    return logout(request);
  }
  return null;
}

async function register(request: Request): Promise<Response> {
  const body = await readJson<RegisterBody>(request);
  if (!body) return error("Некорректный JSON");

  if (!body.email || !body.phone || !body.name || !body.password || !isChannel(body.verificationChannel)) {
    return error("Заполните все поля");
  }
  if (body.password.length < 6) {
    return error("Пароль должен быть не короче 6 символов");
  }

  const email = body.email.trim().toLowerCase();
  const name = body.name.trim();
  const phone = formatPhone(body.phone);
  const digits = phoneDigits(phone);

  if (!EMAIL_RE.test(email)) return error("Некорректный email");
  if (!isCompletePhone(phone)) return error("Телефон в формате +7 (___) ___-__-__");
  if (name.length < 2) return error("Имя должно быть не короче 2 символов");

  const existing = await sql`
    SELECT 1 FROM users
    WHERE email = ${email} OR phone_digits = ${digits}
    LIMIT 1
  `;
  if (existing.length > 0) {
    return error("Пользователь с таким email или телефоном уже есть", 409);
  }

  const passwordHash = await hashPassword(body.password);
  const rows = await sql<UserRow[]>`
    INSERT INTO users (email, phone, phone_digits, name, password_hash, verified, verification_channel)
    VALUES (${email}, ${phone}, ${digits}, ${name}, ${passwordHash}, false, ${body.verificationChannel})
    RETURNING *
  `;
  const user = rows[0];
  if (!user) return error("Не удалось создать пользователя", 500);

  const target = body.verificationChannel === "email" ? user.email : user.phone;
  return json(
    {
      user: toPublicUser(user),
      message: `Код подтверждения отправлен на ${target}. Для проверки используйте код ${VERIFICATION_CODE}.`,
    },
    201,
  );
}

async function verify(request: Request): Promise<Response> {
  const body = await readJson<VerifyBody>(request);
  if (!body?.userId || !body.code) return error("Заполните все поля");

  const rows = await sql<UserRow[]>`
    SELECT * FROM users WHERE id = ${body.userId} LIMIT 1
  `;
  const user = rows[0];
  if (!user) return error("Пользователь не найден", 404);
  if (user.verified) return json({ user: toPublicUser(user) });

  if (body.code.trim() !== VERIFICATION_CODE) {
    return error("Неверный код подтверждения");
  }

  const updated = await sql<UserRow[]>`
    UPDATE users SET verified = true WHERE id = ${user.id} RETURNING *
  `;
  const next = updated[0];
  if (!next) return error("Не удалось подтвердить пользователя", 500);
  return json({ user: toPublicUser(next) });
}

async function login(request: Request): Promise<Response> {
  const body = await readJson<LoginBody>(request);
  if (!body?.login || !body.password) return error("Заполните все поля");

  const login = body.login.trim();
  const digits = phoneDigits(login);
  const email = login.toLowerCase();

  const rows = await sql<UserRow[]>`
    SELECT * FROM users
    WHERE email = ${email} OR phone_digits = ${digits}
    LIMIT 1
  `;
  const user = rows[0];
  if (!user || !(await verifyPassword(body.password, user.password_hash))) {
    return error("Неверный логин или пароль", 401);
  }
  if (!user.verified) {
    return error("Сначала подтвердите email или телефон", 403);
  }

  const token = crypto.randomUUID();
  await sql`
    INSERT INTO sessions (token, user_id) VALUES (${token}, ${user.id})
  `;

  return json({ token, user: toPublicUser(user) });
}

async function logout(request: Request): Promise<Response> {
  const token = getBearerToken(request);
  if (token) {
    await sql`DELETE FROM sessions WHERE token = ${token}`;
  }
  return json({ ok: true });
}

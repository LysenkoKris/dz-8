import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  StoredUser,
  UpdateProfilePayload,
  VerifyPayload,
} from "../types/user";
import { formatPhone, phoneDigits } from "../lib/phone";
import {
  VERIFICATION_CODE,
  createSession,
  delay,
  findSession,
  findUserById,
  findUserByLogin,
  getUsers,
  removeSession,
  toPublicUser,
  upsertUser,
} from "./mockDb";

function ok<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: "OK",
    headers: {},
    config,
  };
}

function fail(
  config: InternalAxiosRequestConfig,
  message: string,
  status = 400,
): AxiosResponse<{ message: string }> {
  return {
    data: { message },
    status,
    statusText: "Error",
    headers: {},
    config,
  };
}

function getAuthToken(config: InternalAxiosRequestConfig): string | null {
  const header = config.headers?.Authorization ?? config.headers?.authorization;
  if (typeof header !== "string") return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

type AuthResult =
  | { ok: true; user: StoredUser; token: string }
  | { ok: false; response: AxiosResponse<{ message: string }> };

function requireUser(config: InternalAxiosRequestConfig): AuthResult {
  const token = getAuthToken(config);
  if (!token) return { ok: false, response: fail(config, "Требуется авторизация", 401) };
  const session = findSession(token);
  if (!session) return { ok: false, response: fail(config, "Сессия недействительна", 401) };
  const user = findUserById(session.userId);
  if (!user) return { ok: false, response: fail(config, "Пользователь не найден", 404) };
  return { ok: true, user, token };
}

async function handle(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  await delay();

  const method = (config.method ?? "get").toLowerCase();
  const url = (config.url ?? "").replace(/^\/+/, "/");
  const body =
    typeof config.data === "string"
      ? (JSON.parse(config.data) as unknown)
      : (config.data as unknown);

  if (method === "post" && url === "/auth/register") {
    const payload = body as RegisterPayload;
    if (!payload.email || !payload.phone || !payload.name || !payload.password) {
      return fail(config, "Заполните все поля");
    }
    if (payload.password.length < 6) {
      return fail(config, "Пароль должен быть не короче 6 символов");
    }
    const phone = formatPhone(payload.phone);
    const exists = getUsers().some(
      (u) =>
        u.email.toLowerCase() === payload.email.trim().toLowerCase() ||
        phoneDigits(u.phone) === phoneDigits(phone),
    );
    if (exists) {
      return fail(config, "Пользователь с таким email или телефоном уже есть", 409);
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      email: payload.email.trim(),
      phone,
      name: payload.name.trim(),
      password: payload.password,
      verified: false,
      verificationChannel: payload.verificationChannel,
      createdAt: new Date().toISOString(),
    };
    upsertUser(user);

    return ok(
      config,
      {
        user: toPublicUser(user),
        message: `Код подтверждения отправлен на ${
          payload.verificationChannel === "email" ? user.email : user.phone
        }. Для мока используйте код ${VERIFICATION_CODE}.`,
      },
      201,
    );
  }

  if (method === "post" && url === "/auth/verify") {
    const payload = body as VerifyPayload;
    const user = findUserById(payload.userId);
    if (!user) return fail(config, "Пользователь не найден", 404);
    if (user.verified) return ok(config, { user: toPublicUser(user) });
    if (payload.code !== VERIFICATION_CODE) {
      return fail(config, "Неверный код подтверждения");
    }
    user.verified = true;
    upsertUser(user);
    return ok(config, { user: toPublicUser(user) });
  }

  if (method === "post" && url === "/auth/login") {
    const payload = body as LoginPayload;
    const user = findUserByLogin(payload.login);
    if (!user || user.password !== payload.password) {
      return fail(config, "Неверный логин или пароль", 401);
    }
    if (!user.verified) {
      return fail(config, "Сначала подтвердите email или телефон", 403);
    }
    const session = createSession(user.id);
    return ok(config, { token: session.token, user: toPublicUser(user) });
  }

  if (method === "post" && url === "/auth/logout") {
    const token = getAuthToken(config);
    if (token) removeSession(token);
    return ok(config, { ok: true });
  }

  if (method === "get" && url === "/me") {
    const auth = requireUser(config);
    if (!auth.ok) return auth.response;
    return ok(config, { user: toPublicUser(auth.user) });
  }

  if (method === "put" && url === "/me") {
    const auth = requireUser(config);
    if (!auth.ok) return auth.response;
    const payload = body as UpdateProfilePayload;
    const { user } = auth;

    if (!payload.name?.trim() || !payload.email?.trim() || !payload.phone?.trim()) {
      return fail(config, "Заполните все поля");
    }

    const phone = formatPhone(payload.phone);
    const conflict = getUsers().some(
      (u) =>
        u.id !== user.id &&
        (u.email.toLowerCase() === payload.email.trim().toLowerCase() ||
          phoneDigits(u.phone) === phoneDigits(phone)),
    );
    if (conflict) {
      return fail(config, "Email или телефон уже заняты", 409);
    }

    user.name = payload.name.trim();
    user.email = payload.email.trim();
    user.phone = phone;
    upsertUser(user);
    return ok(config, { user: toPublicUser(user) });
  }

  if (method === "put" && url === "/me/password") {
    const auth = requireUser(config);
    if (!auth.ok) return auth.response;
    const payload = body as ChangePasswordPayload;
    const { user } = auth;

    if (user.password !== payload.currentPassword) {
      return fail(config, "Текущий пароль неверен", 403);
    }
    if (!payload.newPassword || payload.newPassword.length < 6) {
      return fail(config, "Новый пароль должен быть не короче 6 символов");
    }

    user.password = payload.newPassword;
    upsertUser(user);
    return ok(config, { ok: true });
  }

  return fail(config, `Mock route not found: ${method.toUpperCase()} ${url}`, 404);
}

export const mockAdapter: AxiosAdapter = (config) => handle(config);

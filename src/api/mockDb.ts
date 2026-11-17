import { phoneDigits } from "../lib/phone";
import type { AuthSession, StoredUser, User } from "../types/user";

const USERS_KEY = "dz8:users";
const SESSIONS_KEY = "dz8:sessions";

export const VERIFICATION_CODE = "123456";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers(): StoredUser[] {
  return readJson<StoredUser[]>(USERS_KEY, []);
}

export function saveUsers(users: StoredUser[]): void {
  writeJson(USERS_KEY, users);
}

export function findUserById(id: string): StoredUser | undefined {
  return getUsers().find((u) => u.id === id);
}

export function findUserByLogin(login: string): StoredUser | undefined {
  const normalized = login.trim().toLowerCase();
  const loginPhone = phoneDigits(login);
  return getUsers().find(
    (u) =>
      u.email.toLowerCase() === normalized ||
      phoneDigits(u.phone) === loginPhone,
  );
}

export function upsertUser(user: StoredUser): void {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index === -1) users.push(user);
  else users[index] = user;
  saveUsers(users);
}

export function toPublicUser(user: StoredUser): User {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export function getSessions(): AuthSession[] {
  return readJson<AuthSession[]>(SESSIONS_KEY, []);
}

export function saveSessions(sessions: AuthSession[]): void {
  writeJson(SESSIONS_KEY, sessions);
}

export function createSession(userId: string): AuthSession {
  const session: AuthSession = {
    token: crypto.randomUUID(),
    userId,
  };
  const sessions = getSessions();
  sessions.push(session);
  saveSessions(sessions);
  return session;
}

export function findSession(token: string): AuthSession | undefined {
  return getSessions().find((s) => s.token === token);
}

export function removeSession(token: string): void {
  saveSessions(getSessions().filter((s) => s.token !== token));
}

export function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

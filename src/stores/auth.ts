import { atom, computed } from "nanostores";
import * as authApi from "../api/auth";
import { getErrorMessage, setAuthToken } from "../api/client";
import * as userApi from "../api/user";
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
  VerifyPayload,
} from "../types/user";

const TOKEN_KEY = "dz8:token";
const PENDING_USER_KEY = "dz8:pendingUserId";

export const $user = atom<User | null>(null);
export const $token = atom<string | null>(localStorage.getItem(TOKEN_KEY));
export const $pendingUserId = atom<string | null>(localStorage.getItem(PENDING_USER_KEY));
export const $authLoading = atom(false);
export const $authError = atom<string | null>(null);
export const $authMessage = atom<string | null>(null);

export const $isAuthenticated = computed($token, (token) => Boolean(token));

function persistToken(token: string | null): void {
  $token.set(token);
  setAuthToken(token);
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function persistPendingUserId(userId: string | null): void {
  $pendingUserId.set(userId);
  if (userId) localStorage.setItem(PENDING_USER_KEY, userId);
  else localStorage.removeItem(PENDING_USER_KEY);
}

export function clearAuthFeedback(): void {
  $authError.set(null);
  $authMessage.set(null);
}

export async function bootstrapAuth(): Promise<void> {
  const token = $token.get();
  setAuthToken(token);
  if (!token) return;

  $authLoading.set(true);
  try {
    const user = await userApi.fetchMe();
    $user.set(user);
  } catch {
    persistToken(null);
    $user.set(null);
  } finally {
    $authLoading.set(false);
  }
}

export async function registerUser(payload: RegisterPayload): Promise<boolean> {
  clearAuthFeedback();
  $authLoading.set(true);
  try {
    const result = await authApi.register(payload);
    persistPendingUserId(result.user.id);
    $authMessage.set(result.message);
    return true;
  } catch (error) {
    $authError.set(getErrorMessage(error));
    return false;
  } finally {
    $authLoading.set(false);
  }
}

export async function verifyUser(code: string): Promise<boolean> {
  clearAuthFeedback();
  const userId = $pendingUserId.get();
  if (!userId) {
    $authError.set("Нет пользователя для подтверждения. Зарегистрируйтесь снова.");
    return false;
  }

  $authLoading.set(true);
  try {
    const payload: VerifyPayload = { userId, code };
    const result = await authApi.verify(payload);
    persistPendingUserId(null);
    $authMessage.set(`Аккаунт ${result.user.email} подтверждён. Теперь можно войти.`);
    return true;
  } catch (error) {
    $authError.set(getErrorMessage(error));
    return false;
  } finally {
    $authLoading.set(false);
  }
}

export async function loginUser(payload: LoginPayload): Promise<boolean> {
  clearAuthFeedback();
  $authLoading.set(true);
  try {
    const result = await authApi.login(payload);
    persistToken(result.token);
    $user.set(result.user);
    return true;
  } catch (error) {
    $authError.set(getErrorMessage(error));
    return false;
  } finally {
    $authLoading.set(false);
  }
}

export async function logoutUser(): Promise<void> {
  clearAuthFeedback();
  try {
    await authApi.logout();
  } catch {}
  persistToken(null);
  $user.set(null);
}

export async function saveProfile(payload: UpdateProfilePayload): Promise<boolean> {
  clearAuthFeedback();
  $authLoading.set(true);
  try {
    const user = await userApi.updateProfile(payload);
    $user.set(user);
    $authMessage.set("Профиль обновлён");
    return true;
  } catch (error) {
    $authError.set(getErrorMessage(error));
    return false;
  } finally {
    $authLoading.set(false);
  }
}

export async function savePassword(payload: ChangePasswordPayload): Promise<boolean> {
  clearAuthFeedback();
  $authLoading.set(true);
  try {
    await userApi.changePassword(payload);
    $authMessage.set("Пароль изменён");
    return true;
  } catch (error) {
    $authError.set(getErrorMessage(error));
    return false;
  } finally {
    $authLoading.set(false);
  }
}

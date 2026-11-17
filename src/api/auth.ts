import type {
  LoginPayload,
  RegisterPayload,
  User,
  VerifyPayload,
} from "../types/user";
import { api } from "./client";

export async function register(payload: RegisterPayload): Promise<{
  user: User;
  message: string;
}> {
  const { data } = await api.post<{ user: User; message: string }>("/auth/register", payload);
  return data;
}

export async function verify(payload: VerifyPayload): Promise<{ user: User }> {
  const { data } = await api.post<{ user: User }>("/auth/verify", payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<{ token: string; user: User }> {
  const { data } = await api.post<{ token: string; user: User }>("/auth/login", payload);
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

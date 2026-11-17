import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
  User,
} from "../types/user";
import { api } from "./client";

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>("/me");
  return data.user;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await api.put<{ user: User }>("/me", payload);
  return data.user;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await api.put("/me/password", payload);
}

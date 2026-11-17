import axios from "axios";
import { mockAdapter } from "./mockAdapter";

export const api = axios.create({
  baseURL: "/api",
  adapter: mockAdapter,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token: string | null): void {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function getErrorMessage(error: unknown, fallback = "Что-то пошло не так"): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

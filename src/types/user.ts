export type VerificationChannel = "email" | "phone";

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  verified: boolean;
  verificationChannel: VerificationChannel;
  createdAt: string;
}

export interface StoredUser extends User {
  password: string;
}

export interface AuthSession {
  token: string;
  userId: string;
}

export interface RegisterPayload {
  email: string;
  phone: string;
  name: string;
  password: string;
  verificationChannel: VerificationChannel;
}

export interface LoginPayload {
  login: string;
  password: string;
}

export interface VerifyPayload {
  userId: string;
  code: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ApiErrorBody {
  message: string;
}

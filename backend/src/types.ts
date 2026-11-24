export type VerificationChannel = "email" | "phone";

export interface UserRow {
  id: string;
  email: string;
  phone: string;
  phone_digits: string;
  name: string;
  password_hash: string;
  verified: boolean;
  verification_channel: VerificationChannel;
  created_at: Date | string;
}

export interface PublicUser {
  id: string;
  email: string;
  phone: string;
  name: string;
  verified: boolean;
  verificationChannel: VerificationChannel;
  createdAt: string;
}

export interface RegisterBody {
  email: string;
  phone: string;
  name: string;
  password: string;
  verificationChannel: VerificationChannel;
}

export interface LoginBody {
  login: string;
  password: string;
}

export interface VerifyBody {
  userId: string;
  code: string;
}

export interface UpdateProfileBody {
  name: string;
  email: string;
  phone: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

import type { PublicUser, UserRow } from "../types";

export function toPublicUser(row: UserRow): PublicUser {
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : new Date(row.created_at).toISOString();

  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    name: row.name,
    verified: row.verified,
    verificationChannel: row.verification_channel,
    createdAt,
  };
}

export function phoneDigits(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }
  if (!digits.startsWith("7")) {
    digits = `7${digits}`;
  }

  return digits.slice(0, 11);
}

export function formatPhone(value: string): string {
  const digits = phoneDigits(value);
  const local = digits.slice(1);

  let result = "+7";
  if (local.length === 0) return result;

  result += ` (${local.slice(0, 3)}`;
  if (local.length < 3) return result;

  result += ")";
  if (local.length === 3) return result;

  result += ` ${local.slice(3, 6)}`;
  if (local.length <= 6) return result;

  result += `-${local.slice(6, 8)}`;
  if (local.length <= 8) return result;

  return `${result}-${local.slice(8, 10)}`;
}

export function isCompletePhone(value: string): boolean {
  return phoneDigits(value).length === 11;
}

export function normalizePhone(value: string): string {
  return formatPhone(value);
}

export const PHONE_PLACEHOLDER = "+7 (___) ___-__-__";

import { isCompletePhone, phoneDigits } from "./phone";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_RE = /^\d{6}$/;

function looksLikePhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && isCompletePhone(value);
}

export function required(label: string) {
  return ({ value }: { value: string }) => {
    if (!value.trim()) return `${label} обязательно`;
    return undefined;
  };
}

export function validateName({ value }: { value: string }) {
  const trimmed = value.trim();
  if (!trimmed) return "Имя обязательно";
  if (trimmed.length < 2) return "Имя должно быть не короче 2 символов";
  return undefined;
}

export function validateEmail({ value }: { value: string }) {
  const trimmed = value.trim();
  if (!trimmed) return "Email обязателен";
  if (!EMAIL_RE.test(trimmed)) return "Некорректный email";
  return undefined;
}

export function validatePhone({ value }: { value: string }) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "+7") return "Телефон обязателен";
  if (!isCompletePhone(trimmed)) {
    return "Телефон в формате +7 (___) ___-__-__";
  }
  return undefined;
}

export function validatePassword({ value }: { value: string }) {
  if (!value) return "Пароль обязателен";
  if (value.length < 6) return "Пароль должен быть не короче 6 символов";
  return undefined;
}

export function validateLogin({ value }: { value: string }) {
  const trimmed = value.trim();
  if (!trimmed) return "Укажите email или телефон";
  const isEmail = EMAIL_RE.test(trimmed);
  const isPhone = looksLikePhone(trimmed) || phoneDigits(trimmed).length === 11;
  if (!isEmail && !isPhone) return "Введите корректный email или телефон";
  return undefined;
}

export function validateVerificationCode({ value }: { value: string }) {
  const trimmed = value.trim();
  if (!trimmed) return "Введите код подтверждения";
  if (!CODE_RE.test(trimmed)) return "Код должен состоять из 6 цифр";
  return undefined;
}

export function passwordsMatch(password: string, confirm: string) {
  if (!confirm) return "Повторите новый пароль";
  if (password !== confirm) return "Новые пароли не совпадают";
  return undefined;
}

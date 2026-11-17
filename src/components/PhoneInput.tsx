import type { ChangeEvent, FocusEvent } from "react";
import { formatPhone, PHONE_PLACEHOLDER } from "../lib/phone";

interface PhoneInputProps {
  name: string;
  value: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  invalid?: boolean;
  autoComplete?: string;
}

export function PhoneInput({
  name,
  value,
  onBlur,
  onChange,
  invalid = false,
  autoComplete = "tel",
}: PhoneInputProps) {
  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    if (!event.target.value.trim()) {
      onChange("+7");
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    if (next.trim() === "" || next === "+" || next === "+7") {
      onChange(next === "+" ? "+7" : next === "" ? "" : "+7");
      return;
    }
    onChange(formatPhone(next));
  }

  function handleBlur() {
    if (value === "+7" || value.trim() === "") {
      onChange("");
    } else {
      onChange(formatPhone(value));
    }
    onBlur();
  }

  return (
    <input
      type="tel"
      name={name}
      value={value}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      placeholder={PHONE_PLACEHOLDER}
      autoComplete={autoComplete}
      inputMode="tel"
      aria-invalid={invalid}
    />
  );
}

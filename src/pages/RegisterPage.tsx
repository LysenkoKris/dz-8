import { useForm } from "@tanstack/react-form";
import { useStore } from "@nanostores/react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Feedback } from "../components/Feedback";
import { FieldError } from "../components/FieldError";
import { PhoneInput } from "../components/PhoneInput";
import { formatPhone } from "../lib/phone";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from "../lib/validators";
import {
  $authError,
  $authLoading,
  $authMessage,
  clearAuthFeedback,
  registerUser,
} from "../stores/auth";
import type { VerificationChannel } from "../types/user";

export function RegisterPage() {
  const navigate = useNavigate();
  const loading = useStore($authLoading);
  const error = useStore($authError);
  const message = useStore($authMessage);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      verificationChannel: "email" as VerificationChannel,
    },
    onSubmit: async ({ value }) => {
      clearAuthFeedback();
      const ok = await registerUser({
        name: value.name.trim(),
        email: value.email.trim(),
        phone: formatPhone(value.phone),
        password: value.password,
        verificationChannel: value.verificationChannel,
      });
      if (ok) navigate("/verify");
    },
  });

  return (
    <AuthLayout
      title="Регистрация"
      subtitle="Создайте аккаунт. Подтверждение — кодом из мока."
    >
      <Feedback error={error} message={message} />
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="name"
          validators={{ onChange: validateName, onSubmit: validateName }}
        >
          {(field) => (
            <label>
              Имя
              <input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="name"
                aria-invalid={field.state.meta.errors.length > 0}
              />
              <FieldError
                errors={field.state.meta.errors}
                touched={field.state.meta.isTouched || form.state.submissionAttempts > 0}
              />
            </label>
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{ onChange: validateEmail, onSubmit: validateEmail }}
        >
          {(field) => (
            <label>
              Email
              <input
                type="email"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="email"
                aria-invalid={field.state.meta.errors.length > 0}
              />
              <FieldError
                errors={field.state.meta.errors}
                touched={field.state.meta.isTouched || form.state.submissionAttempts > 0}
              />
            </label>
          )}
        </form.Field>

        <form.Field
          name="phone"
          validators={{ onChange: validatePhone, onSubmit: validatePhone }}
        >
          {(field) => (
            <label>
              Телефон
              <PhoneInput
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                invalid={field.state.meta.errors.length > 0}
              />
              <FieldError
                errors={field.state.meta.errors}
                touched={field.state.meta.isTouched || form.state.submissionAttempts > 0}
              />
            </label>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{ onChange: validatePassword, onSubmit: validatePassword }}
        >
          {(field) => (
            <label>
              Пароль
              <input
                type="password"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="new-password"
                aria-invalid={field.state.meta.errors.length > 0}
              />
              <FieldError
                errors={field.state.meta.errors}
                touched={field.state.meta.isTouched || form.state.submissionAttempts > 0}
              />
            </label>
          )}
        </form.Field>

        <form.Field name="verificationChannel">
          {(field) => (
            <fieldset className="radio-row">
              <legend>Подтвердить через</legend>
              <label className="inline">
                <input
                  type="radio"
                  name={field.name}
                  checked={field.state.value === "email"}
                  onChange={() => field.handleChange("email")}
                />
                Email
              </label>
              <label className="inline">
                <input
                  type="radio"
                  name={field.name}
                  checked={field.state.value === "phone"}
                  onChange={() => field.handleChange("phone")}
                />
                Телефон
              </label>
            </fieldset>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <button type="submit" disabled={loading || isSubmitting || !canSubmit}>
              {loading || isSubmitting ? "Отправка…" : "Зарегистрироваться"}
            </button>
          )}
        </form.Subscribe>
      </form>
      <p className="form-footer">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </AuthLayout>
  );
}

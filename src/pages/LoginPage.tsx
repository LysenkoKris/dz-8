import { useForm } from "@tanstack/react-form";
import { useStore } from "@nanostores/react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Feedback } from "../components/Feedback";
import { FieldError } from "../components/FieldError";
import { required, validateLogin } from "../lib/validators";
import {
  $authError,
  $authLoading,
  $authMessage,
  $isAuthenticated,
  clearAuthFeedback,
  loginUser,
} from "../stores/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useStore($isAuthenticated);
  const loading = useStore($authLoading);
  const error = useStore($authError);
  const message = useStore($authMessage);

  const form = useForm({
    defaultValues: {
      login: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      clearAuthFeedback();
      const ok = await loginUser({
        login: value.login.trim(),
        password: value.password,
      });
      if (ok) navigate("/dashboard");
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout title="Вход">
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
          name="login"
          validators={{ onChange: validateLogin, onSubmit: validateLogin }}
        >
          {(field) => (
            <label>
              Email или телефон
              <input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="username"
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
          name="password"
          validators={{
            onChange: required("Пароль"),
            onSubmit: required("Пароль"),
          }}
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
                autoComplete="current-password"
                aria-invalid={field.state.meta.errors.length > 0}
              />
              <FieldError
                errors={field.state.meta.errors}
                touched={field.state.meta.isTouched || form.state.submissionAttempts > 0}
              />
            </label>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <button type="submit" disabled={loading || isSubmitting || !canSubmit}>
              {loading || isSubmitting ? "Вход…" : "Войти"}
            </button>
          )}
        </form.Subscribe>
      </form>
      <p className="form-footer">
        Нет аккаунта? <Link to="/register">Регистрация</Link>
        {" · "}
        <Link to="/verify">Подтверждение</Link>
      </p>
    </AuthLayout>
  );
}

import { useForm } from "@tanstack/react-form";
import { useStore } from "@nanostores/react";
import { Link, useNavigate } from "react-router-dom";
import { VERIFICATION_CODE } from "../constants";
import { AuthLayout } from "../components/AuthLayout";
import { Feedback } from "../components/Feedback";
import { FieldError } from "../components/FieldError";
import { validateVerificationCode } from "../lib/validators";
import {
  $authError,
  $authLoading,
  $authMessage,
  $pendingUserId,
  clearAuthFeedback,
  verifyUser,
} from "../stores/auth";

export function VerifyPage() {
  const navigate = useNavigate();
  const loading = useStore($authLoading);
  const error = useStore($authError);
  const message = useStore($authMessage);
  const pendingUserId = useStore($pendingUserId);

  const form = useForm({
    defaultValues: {
      code: "",
    },
    onSubmit: async ({ value }) => {
      clearAuthFeedback();
      const ok = await verifyUser(value.code.trim());
      if (ok) navigate("/login");
    },
  });

  return (
    <AuthLayout
      title="Подтверждение"
      subtitle="Введите код из письма или SMS."
    >
      <Feedback error={error} message={message} />

      {!pendingUserId ? (
        <div className="alert alert-error">
          Нет ожидающего подтверждения пользователя.{" "}
          <Link to="/register">Зарегистрируйтесь</Link>.
        </div>
      ) : (
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <p className="hint">
            Код для проверки: <code>{VERIFICATION_CODE}</code>
          </p>
          <form.Field
            name="code"
            validators={{
              onChange: validateVerificationCode,
              onSubmit: validateVerificationCode,
            }}
          >
            {(field) => (
              <label>
                Код подтверждения
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  inputMode="numeric"
                  placeholder="123456"
                  autoComplete="one-time-code"
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
                {loading || isSubmitting ? "Проверка…" : "Подтвердить"}
              </button>
            )}
          </form.Subscribe>
        </form>
      )}

      <p className="form-footer">
        <Link to="/login">К логину</Link>
      </p>
    </AuthLayout>
  );
}

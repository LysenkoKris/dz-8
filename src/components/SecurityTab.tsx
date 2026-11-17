import { useForm } from "@tanstack/react-form";
import { useStore } from "@nanostores/react";
import { Feedback } from "./Feedback";
import { FieldError } from "./FieldError";
import { passwordsMatch, required, validatePassword } from "../lib/validators";
import {
  $authError,
  $authLoading,
  $authMessage,
  clearAuthFeedback,
  savePassword,
} from "../stores/auth";

export function SecurityTab() {
  const loading = useStore($authLoading);
  const error = useStore($authError);
  const message = useStore($authMessage);

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      clearAuthFeedback();
      const ok = await savePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      });
      if (ok) form.reset();
    },
  });

  return (
    <section className="tab-panel">
      <h2>Безопасность</h2>
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
          name="currentPassword"
          validators={{
            onChange: required("Текущий пароль"),
            onSubmit: required("Текущий пароль"),
          }}
        >
          {(field) => (
            <label>
              Текущий пароль
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

        <form.Field
          name="newPassword"
          validators={{
            onChange: validatePassword,
            onSubmit: validatePassword,
          }}
        >
          {(field) => (
            <label>
              Новый пароль
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

        <form.Field
          name="confirmPassword"
          validators={{
            onChangeListenTo: ["newPassword"],
            onChange: ({ value, fieldApi }) =>
              passwordsMatch(fieldApi.form.getFieldValue("newPassword"), value),
            onSubmit: ({ value, fieldApi }) =>
              passwordsMatch(fieldApi.form.getFieldValue("newPassword"), value),
          }}
        >
          {(field) => (
            <label>
              Повтор нового пароля
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

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <button type="submit" disabled={loading || isSubmitting || !canSubmit}>
              {loading || isSubmitting ? "Сохранение…" : "Сменить пароль"}
            </button>
          )}
        </form.Subscribe>
      </form>
    </section>
  );
}

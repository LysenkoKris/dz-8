import { useForm } from "@tanstack/react-form";
import { useStore } from "@nanostores/react";
import { Feedback } from "./Feedback";
import { FieldError } from "./FieldError";
import { PhoneInput } from "./PhoneInput";
import { formatPhone } from "../lib/phone";
import {
  validateEmail,
  validateName,
  validatePhone,
} from "../lib/validators";
import {
  $authError,
  $authLoading,
  $authMessage,
  $user,
  clearAuthFeedback,
  saveProfile,
} from "../stores/auth";
import type { User } from "../types/user";

function ProfileForm({ user }: { user: User }) {
  const loading = useStore($authLoading);
  const error = useStore($authError);
  const message = useStore($authMessage);

  const form = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: formatPhone(user.phone),
    },
    onSubmit: async ({ value }) => {
      clearAuthFeedback();
      await saveProfile({
        name: value.name.trim(),
        email: value.email.trim(),
        phone: formatPhone(value.phone),
      });
    },
  });

  return (
    <section className="tab-panel">
      <h2>Общие данные</h2>
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

        <dl className="meta">
          <div>
            <dt>ID</dt>
            <dd>
              <code>{user.id}</code>
            </dd>
          </div>
          <div>
            <dt>Создан</dt>
            <dd>{new Date(user.createdAt).toLocaleString("ru-RU")}</dd>
          </div>
        </dl>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <button type="submit" disabled={loading || isSubmitting || !canSubmit}>
              {loading || isSubmitting ? "Сохранение…" : "Сохранить"}
            </button>
          )}
        </form.Subscribe>
      </form>
    </section>
  );
}

export function ProfileTab() {
  const user = useStore($user);
  if (!user) return <p className="muted">Нет данных пользователя</p>;
  return <ProfileForm key={user.id} user={user} />;
}

interface FieldErrorProps {
  errors: unknown[];
  touched?: boolean;
}

export function FieldError({ errors, touched = true }: FieldErrorProps) {
  if (!touched || errors.length === 0) return null;

  const message = errors
    .map((error) => {
      if (typeof error === "string") return error;
      if (error instanceof Error) return error.message;
      return null;
    })
    .filter(Boolean)
    .join(", ");

  if (!message) return null;

  return <span className="field-error">{message}</span>;
}

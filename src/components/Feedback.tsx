interface FeedbackProps {
  error?: string | null;
  message?: string | null;
}

export function Feedback({ error, message }: FeedbackProps) {
  if (!error && !message) return null;

  return (
    <div className="feedback-stack">
      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-ok">{message}</div> : null}
    </div>
  );
}

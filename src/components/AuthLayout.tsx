import { Link } from "react-router-dom";
import type { ReactNode } from "react";


interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <header className="auth-brand">
        <Link to="/" className="brand-link">
          User Service
        </Link>
      </header>
      <main className="auth-card">
        <h1>{title}</h1>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
        {children}
      </main>
    </div>
  );
}

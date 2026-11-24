import { useStore } from "@nanostores/react";
import { Link } from "react-router-dom";
import { $isAuthenticated } from "../stores/auth";

export function HomePage() {
  const isAuthenticated = useStore($isAuthenticated);

  return (
    <div className="home-shell">
      <div className="home-panel">
        <p className="eyebrow">DZ-8</p>
        <h1>User Service</h1>
        <p className="muted">
          Фронт и бэкенд сервиса управления пользователями.
        </p>
        <div className="cta-row">
          {isAuthenticated ? (
            <Link className="button" to="/dashboard">
              Открыть дэшборд
            </Link>
          ) : (
            <>
              <Link className="button" to="/register">
                Регистрация
              </Link>
              <Link className="button ghost-link" to="/login">
                Вход
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

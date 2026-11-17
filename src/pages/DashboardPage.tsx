import { useStore } from "@nanostores/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProfileTab } from "../components/ProfileTab";
import { SecurityTab } from "../components/SecurityTab";
import { $user, clearAuthFeedback, logoutUser } from "../stores/auth";

type Tab = "profile" | "security";

export function DashboardPage() {
  const user = useStore($user);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");

  async function onLogout() {
    await logoutUser();
    navigate("/login");
  }

  function switchTab(next: Tab) {
    clearAuthFeedback();
    setTab(next);
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <Link to="/dashboard" className="brand-link">
            User Service
          </Link>
          <p className="muted small">
            {user ? `Привет, ${user.name}` : "Дэшборд пользователя"}
          </p>
        </div>
        <button type="button" className="ghost" onClick={onLogout}>
          Выйти
        </button>
      </header>

      <nav className="tabs" aria-label="Разделы дэшборда">
        <button
          type="button"
          className={tab === "profile" ? "tab active" : "tab"}
          onClick={() => switchTab("profile")}
        >
          Общие данные
        </button>
        <button
          type="button"
          className={tab === "security" ? "tab active" : "tab"}
          onClick={() => switchTab("security")}
        >
          Безопасность
        </button>
      </nav>

      {tab === "profile" ? <ProfileTab /> : <SecurityTab />}
    </div>
  );
}

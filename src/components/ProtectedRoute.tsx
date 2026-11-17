import { useStore } from "@nanostores/react";
import { Navigate, Outlet } from "react-router-dom";
import { $authLoading, $isAuthenticated } from "../stores/auth";

export function ProtectedRoute() {
  const isAuthenticated = useStore($isAuthenticated);
  const loading = useStore($authLoading);

  if (loading && !isAuthenticated) {
    return <div className="page-center muted">Загрузка…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

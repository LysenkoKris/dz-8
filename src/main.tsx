import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { bootstrapAuth } from "./stores/auth";
import "./styles/index.css";

function Root() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void bootstrapAuth().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="page-center muted">Загрузка…</div>;
  }

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);

import "../index.css";

import { createRoot } from "react-dom/client";

import { ErrorBoundary } from "@/core/errors";

import App from "./App";

const initializeDevelopmentTools =
  async (): Promise<void> => {
    if (!import.meta.env.DEV) {
      return;
    }

    const { keiDev } =
      await import("@/dev");

    window.keiDev = keiDev;

    console.info(
      "KEI developer harness available as window.keiDev",
    );
  };

void initializeDevelopmentTools();

createRoot(
  document.getElementById("root")!,
).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
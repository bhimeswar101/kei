import "../index.css";

import { createRoot } from "react-dom/client";

import { ErrorBoundary } from "@/core/errors";

import App from "./App";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
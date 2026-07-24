import "../index.css";
import { createRoot } from "react-dom/client";

import App from "./App";
import { ErrorBoundary } from "@/core/errors";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
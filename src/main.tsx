import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary, Provider as RollbarProvider } from "@rollbar/react";

import "./index.scss";
import App from "./App.tsx";

const rollbarConfig = {
  accessToken: import.meta.env.VITE_ROLLBAR_ACCESS_TOKEN,
  environment: import.meta.env.MODE,
  enabled:
    !!import.meta.env.VITE_ROLLBAR_ACCESS_TOKEN &&
    import.meta.env.MODE === "production",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RollbarProvider config={rollbarConfig}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </RollbarProvider>
  </StrictMode>
);

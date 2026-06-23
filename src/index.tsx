import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

import "./input.css";

import { App } from "./components/App";
import { ErrorFallback } from "./components/ErrorFallback";
import { GlobalErrorWrapper } from "./components/GlobalErrorWrapper";

const container = document.createElement("div");
container.id = "app";
document.body.appendChild(container);

const root = createRoot(container);
root.render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <GlobalErrorWrapper>
        <App />
      </GlobalErrorWrapper>
    </ErrorBoundary>
  </StrictMode>
);

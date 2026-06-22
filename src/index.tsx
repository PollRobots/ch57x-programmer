import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./input.css";

import { App } from "./components/App";

const container = document.createElement("div");
container.id = "app";
document.body.appendChild(container);

const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

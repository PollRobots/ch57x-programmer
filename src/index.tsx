import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const container = document.createElement("div");
container.id = "app";
document.body.appendChild(container);

const root = createRoot(container);
root.render(
  <StrictMode>
    <h1>Hello, world!</h1>
  </StrictMode>,
);

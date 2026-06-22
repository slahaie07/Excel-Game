import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ConvexAppProvider } from "./lib/convex";
import { initMobileShell } from "./lib/mobile";
import "./styles/global.css";

void initMobileShell();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAppProvider>
      <App />
    </ConvexAppProvider>
  </StrictMode>,
);

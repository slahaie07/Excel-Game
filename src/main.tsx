import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ConvexAppProvider } from "./lib/convex";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAppProvider>
      <App />
    </ConvexAppProvider>
  </StrictMode>,
);

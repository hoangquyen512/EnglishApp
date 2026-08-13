import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initDatabase } from "./db";
import "./index.css";

async function bootstrap() {
  await initDatabase();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();

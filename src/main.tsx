import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "@/app/globals.css";

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  );
}

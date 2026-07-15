import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "@/App";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { TenantProvider } from "@/components/tenant/TenantProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { GlobalErrorBoundary } from "@/components/layout/GlobalErrorBoundary";
import "@/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <GlobalErrorBoundary>
          <AuthProvider>
            <TenantProvider>
              <App />
            </TenantProvider>
          </AuthProvider>
        </GlobalErrorBoundary>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);

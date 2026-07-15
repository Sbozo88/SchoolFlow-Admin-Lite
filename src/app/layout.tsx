import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { TenantProvider } from "@/components/tenant/TenantProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SchoolFlow Admin Lite",
    template: "%s | SchoolFlow Admin Lite",
  },
  description: "Minimal admin-only foundation for SchoolFlow operations.",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased bg-slate-50 text-slate-900" suppressHydrationWarning>
      <body className="min-h-full">
        <ThemeProvider>
          <AuthProvider>
            <TenantProvider>{children}</TenantProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

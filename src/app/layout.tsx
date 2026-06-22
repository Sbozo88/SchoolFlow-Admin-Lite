import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SchoolFlow Admin LITE",
    template: "%s | SchoolFlow Admin LITE",
  },
  description: "Minimal admin-only foundation for SchoolFlow operations.",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    try {
      if (localStorage.getItem("schoolflow-theme-version") !== "2") {
        localStorage.setItem("schoolflow-theme", "light");
        localStorage.setItem("schoolflow-theme-version", "2");
      }
      const theme = localStorage.getItem("schoolflow-theme") === "dark" ? "dark" : "light";
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.style.colorScheme = theme;
    } catch (_) {}
  `;

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

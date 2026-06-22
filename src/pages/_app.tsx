import type { AppProps } from "next/app";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "@/app/globals.css";

export default function PagesApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

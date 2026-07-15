import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const firebaseKeys = ["API_KEY", "AUTH_DOMAIN", "PROJECT_ID", "STORAGE_BUCKET", "MESSAGING_SENDER_ID", "APP_ID"] as const;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const define = Object.fromEntries(firebaseKeys.map((key) => [
    `import.meta.env.VITE_FIREBASE_${key}`,
    JSON.stringify(env[`VITE_FIREBASE_${key}`] || ""),
  ]));

  return {
    plugins: [react()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    define,
    server: { host: "127.0.0.1", port: 3000 },
    preview: { host: "127.0.0.1", port: 3000 },
    build: {
      target: "es2022",
      sourcemap: true,
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/@firebase/firestore/")) return "firebase-firestore";
            if (id.includes("node_modules/@firebase/auth/")) return "firebase-auth";
            if (id.includes("node_modules/@firebase/") || id.includes("node_modules/firebase/")) return "firebase-core";
            if (id.includes("node_modules/recharts/") || id.includes("node_modules/d3-")) return "charts";
            if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/react-router")) return "react-vendor";
            if (id.includes("node_modules/lucide-react/")) return "icons";
          },
        },
      },
    },
  };
});

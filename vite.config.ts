import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget =
    env.VITE_API_PROXY_TARGET || "http://43.201.139.24:8080";

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: { overlay: false },
      proxy: {
        // 백엔드가 localhost CORS를 막아두면 dev에서는 same-origin으로 우회.
        // FE가 상대 경로(/api/...)로 호출하면 Vite가 백엔드로 전달.
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/oauth2": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/login/oauth2": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
  };
});

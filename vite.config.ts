import { defineConfig, loadEnv, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget =
    env.VITE_API_PROXY_TARGET || "http://43.201.139.24:8080";
  const proxyOrigin = new URL(proxyTarget).origin;
  const backendProxy: ProxyOptions = {
    target: proxyTarget,
    changeOrigin: true,
    headers: {
      origin: proxyOrigin,
    },
    configure: (proxy) => {
      proxy.on("proxyReq", (proxyReq) => {
        proxyReq.setHeader("origin", proxyOrigin);
      });
    },
  };

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: { overlay: false },
      proxy: {
        // 백엔드가 localhost CORS를 막아두면 dev에서는 same-origin으로 우회.
        // FE가 상대 경로(/api/...)로 호출하면 Vite가 백엔드로 전달.
        "/api": backendProxy,
        "/oauth2": backendProxy,
        "/login/oauth2": backendProxy,
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

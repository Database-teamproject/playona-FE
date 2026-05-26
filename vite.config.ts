import { defineConfig, loadEnv, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

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
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.svg",
          "favicon.ico",
          "apple-touch-icon.png",
          "robots.txt",
          "sitemap.xml",
        ],
        manifest: {
          name: "Playona — 음악을 공유하는 가장 쉬운 방법",
          short_name: "Playona",
          description:
            "어떤 음악 링크든 모든 플랫폼에서 열리는 하나의 링크로 변환하세요.",
          lang: "ko",
          start_url: "/",
          scope: "/",
          display: "standalone",
          background_color: "#0A0A0F",
          theme_color: "#0A0A0F",
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          // Android 시스템 공유 시트에 Playona를 공유 대상으로 등록.
          // 다른 앱에서 "공유" → Playona 선택 시 /?title=&text=&url= 로 진입.
          share_target: {
            action: "/",
            method: "GET",
            enctype: "application/x-www-form-urlencoded",
            params: {
              title: "title",
              text: "text",
              url: "url",
            },
          },
        },
        workbox: {
          // SPA fallback이 백엔드 경유·SEO 파일을 가로채지 않도록 제외.
          navigateFallbackDenylist: [
            /^\/api/,
            /^\/oauth2/,
            /^\/login/,
            /^\/sitemap\.xml$/,
            /^\/robots\.txt$/,
            /^\/og-image\.png$/,
          ],
          globPatterns: ["**/*.{js,css,html,svg,png,ico,woff,woff2}"],
          cleanupOutdatedCaches: true,
        },
        devOptions: {
          enabled: false,
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
  };
});

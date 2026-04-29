import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_BASE_PATH || "/";

  const proxyTarget = env.VITE_DEV_PROXY_TARGET;
  const proxy =
    proxyTarget && proxyTarget.startsWith("http")
      ? {
          "/proxy-api": {
            target: proxyTarget,
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/proxy-api/, ""),
          },
        }
      : undefined;

  return {
    plugins: [react()],
    base,
    server: {
      port: 5173,
      proxy,
    },
  };
});

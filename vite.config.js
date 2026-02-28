import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const tunnelDomain = env.VITE_TUNNEL_DOMAIN || "";
  const host = env.VITE_DEV_HOST || "0.0.0.0";
  const port = Number(env.VITE_DEV_PORT || 5173);
  const protocol = env.VITE_HMR_PROTOCOL || (tunnelDomain ? "wss" : "ws");

  return {
    plugins: [react()],
    server: {
      host,
      port,
      strictPort: true,
      allowedHosts: ["localhost", "127.0.0.1", ".ngrok-free.app"],
      hmr: tunnelDomain
        ? {
            protocol,
            host: tunnelDomain,
            clientPort: 443,
          }
        : undefined,
      origin: tunnelDomain ? `https://${tunnelDomain}` : undefined,
    },
    preview: {
      host,
      port,
      strictPort: true,
      allowedHosts: ["localhost", "127.0.0.1", ".ngrok-free.app"],
    },
  };
});

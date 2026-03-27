import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    base: "/",
    server: {
      host: true,
      port: 3000,
      proxy: {
        "/api": {
          target: env.VITE_PROXY_TARGET || "http://localhost:6969",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            "mui-vendor": [
              "@mui/material",
              "@mui/icons-material",
              "@mui/system",
              "@mui/x-date-pickers",
              "@mui/styles",
            ],
            "redux-vendor": [
              "react-redux",
              "redux",
              "redux-thunk",
              "@redux-devtools/extension",
            ],
            "dnd-kit": ["@dnd-kit/core", "@dnd-kit/modifiers", "@dnd-kit/sortable"],
            charts: ["recharts"],
            socket: ["socket.io-client"],
            "date-utils": ["dayjs"],
            utils: [
              "axios",
              "query-string",
              "jwt-decode",
              "history",
              "react-barcode",
              "lodash",
            ],
          },
        },
      },
    },
  };
});

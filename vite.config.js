import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
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
          "redux-vendor": ["react-redux", "redux", "redux-thunk", "@redux-devtools/extension"],
          "dnd-kit": ["@dnd-kit/core", "@dnd-kit/modifiers", "@dnd-kit/sortable"],
          charts: ["recharts"],
          socket: ["socket.io-client"],
          "date-utils": ["dayjs"],
          utils: ["axios", "query-string", "jwt-decode", "history", "react-barcode", "lodash"],
        },
      },
    },
  },
});

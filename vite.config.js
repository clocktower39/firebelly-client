import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const vendorChunks = [
  {
    name: "react-vendor",
    packages: ["react", "react-dom"],
  },
  {
    name: "mui-vendor",
    packages: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/system",
      "@mui/x-date-pickers",
    ],
  },
  {
    name: "redux-vendor",
    packages: [
      "react-redux",
      "redux",
      "redux-thunk",
      "@redux-devtools/extension",
    ],
  },
  {
    name: "routing",
    packages: ["react-router-dom", "react-router-hash-link"],
  },
  {
    name: "dnd-kit",
    packages: ["@dnd-kit/core", "@dnd-kit/modifiers", "@dnd-kit/sortable"],
  },
  {
    name: "charts",
    packages: ["recharts"],
  },
  {
    name: "socket",
    packages: ["socket.io-client"],
  },
  {
    name: "date-utils",
    packages: ["dayjs"],
  },
  {
    name: "utils",
    packages: [
      "axios",
      "jwt-decode",
      "history",
      "react-barcode",
      "fast-deep-equal",
      "html-to-image",
      "lodash",
      "prop-types",
      "query-string",
      "react-input-mask",
      "react-swipeable-views",
    ],
  },
];

const getPackageMatcher = (packageName) =>
  packageName.startsWith("@")
    ? `/node_modules/${packageName}/`
    : `/node_modules/${packageName}/`;

const manualChunks = (id) => {
  const normalizedId = id.replaceAll("\\", "/");
  if (!normalizedId.includes("/node_modules/")) return undefined;

  const match = vendorChunks.find((chunk) =>
    chunk.packages.some((packageName) =>
      normalizedId.includes(getPackageMatcher(packageName))
    )
  );

  return match?.name;
};

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
        "/socket.io": {
          target: env.VITE_PROXY_TARGET || "http://localhost:6969",
          changeOrigin: true,
          ws: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks,
        },
      },
    },
  };
});

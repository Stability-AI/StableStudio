import * as ChildProcess from "child_process";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const redirectComfy = {
  target: "http://localhost:5000",
  changeOrigin: true,
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const gitHash = ChildProcess.execSync("git rev-parse HEAD").toString().trim();

  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd()),

    VITE_GIT_HASH: gitHash,
  };

  return {
    build: { target: "es2020" },

    server: {
      port: 3000,
      fs: { strict: false },
      proxy: {
        "/comfyui": {
          target: "http://localhost:5000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/comfyui/, ""),
        },
        "/lib": redirectComfy,
        "/scripts": redirectComfy,
        "/style.css": redirectComfy,
        "/ws": {
          target: "http://localhost:5000",
          changeOrigin: true,
          ws: true,
        },
        "/api": redirectComfy,
        "/prompt": redirectComfy,
        "/extensions": redirectComfy,
        "/object_info": redirectComfy,
        "/view": redirectComfy,
        "/queue": redirectComfy,
        "/history": redirectComfy,
        "/interrupt": redirectComfy,
        "/upload": redirectComfy,
      },
    },

    optimizeDeps: {
      esbuildOptions: {
        target: "es2020",
      },
    },

    plugins: [tsconfigPaths(), react({ jsxImportSource: "@emotion/react" })],
  };
});

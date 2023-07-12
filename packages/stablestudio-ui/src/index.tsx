import { readTextFile } from "@tauri-apps/api/fs";
import { resolveResource } from "@tauri-apps/api/path";
// alternatively, use `window.__TAURI__.path.resolveResource`
// alternatively, use `window.__TAURI__.fs.readTextFile`

import ReactDOM from "react-dom/client";

import "~/GlobalVariables";

import { App } from "~/App";

(async () => {
  const resourcePath = await resolveResource(
    "comfyui/README_VERY_IMPORTANT.txt"
  );
  console.log(resourcePath, await readTextFile(resourcePath));
})();

const main = async () => {
  const root = document.getElementById("app");
  root &&
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
};

main();

import ReactDOM from "react-dom/client";

import "~/GlobalVariables";

import { App } from "~/App";

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

import * as ReactRouter from "react-router-dom";

import { Editor } from "~/Editor";
import { Generation } from "~/Generation";
import { Plugin } from "~/Plugin";
import { Settings } from "~/Settings";

export function Router() {
  const navigate = Router.useNavigate();
  const settings = Plugin.use(({ settings }) => settings ?? {});

  useEffect(() => {
    const isMissingRequiredSetting = Object.entries(settings).find(
      ([, setting]) => (setting as any).required && !(setting as any).value
    );

    isMissingRequiredSetting && navigate("/settings");
  }, [navigate, settings]);

  return <Router.Routes />;
}

export namespace Router {
  export type Route = string;

  export function Routes() {
    return ReactRouter.useRoutes(
      Routes.use() as Mutable<ReturnType<typeof Routes.use>>
    );
  }

  export namespace Routes {
    export function use() {
      return useMemo(
        () =>
          [
            {
              path: "/generate",
              element: <Generation />,
            },
            {
              path: "/edit",
              element: <Editor />,
            },
            {
              path: "/nodes",
              element: (
                <iframe
                  src="http://localhost:3000/comfyui"
                  className="h-full w-full"
                  id="comfyui-window"
                />
              ),
            },
            {
              path: "/settings",
              element: <Settings />,
            },
            {
              path: "*",
              element: <ReactRouter.Navigate to={`/generate`} replace />,
            },
          ] as const,
        []
      );
    }
  }

  export const useNavigate = ReactRouter.useNavigate;
  export const useLocation = ReactRouter.useLocation;

  export const Provider = ReactRouter.BrowserRouter;
}

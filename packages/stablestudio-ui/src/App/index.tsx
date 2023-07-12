import { BaseDirectory, exists } from "@tauri-apps/api/fs";
import { Router } from "~/Router";
import { Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

import { BottomBar } from "./BottomBar";
import { Providers } from "./Providers";
import { Sidebar, Sidebars } from "./Sidebar";
import { TopBar } from "./TopBar";

export function App() {
  const isMobileDevice = Theme.useIsMobileDevice();
  const { isSetup, message, progress } = App.useSetupState();

  return useMemo(
    () => (
      <Providers>
        <div className="absolute left-0 top-0 -z-50 h-screen w-screen dark:bg-zinc-800" />
        <div className="absolute left-0 top-0 flex h-screen w-screen flex-col text-white sm:overflow-x-auto">
          {isSetup !== App.SetupState.WeightsInstalled ? (
            <>
              <div className="flex flex-grow flex-col items-center justify-center gap-4">
                <h1 className="text-6xl font-bold">Welcome to StableStudio</h1>
                <p className="font-mono opacity-75">
                  {message} {Math.round(progress * 100)}%
                </p>
              </div>
            </>
          ) : (
            <>
              <Shortcut.Palette />
              <TopBar />
              <Sidebars />
              <div className="flex min-h-0 grow overflow-auto sm:min-w-[1000px]">
                <Sidebar position="left" />
                <div className="shrink grow overflow-y-auto">
                  <Router />
                </div>
                <Sidebar position="right" />
              </div>
              {isMobileDevice && <BottomBar />}
            </>
          )}
        </div>
      </Providers>
    ),
    [isMobileDevice, isSetup, message, progress]
  );
}

export declare namespace App {
  export { Sidebar, TopBar };
}

export namespace App {
  App.Sidebar = Sidebar;
  App.TopBar = TopBar;

  export enum SetupState {
    NotStarted,
    ComfyInstalled,
    WeightsInstalled,
  }

  export const useSetupState = () => {
    const [isSetup, setIsSetup] = useState<SetupState>(SetupState.NotStarted);
    const [message, setMessage] = useState<string>("");
    const [progress] = useState<number>(0);

    const check = async () => {
      const modelExists = await exists(
        "comfyui/ComfyUI/models/checkpoints/sd_xl_base_0.9.safetensors",
        {
          dir: BaseDirectory.AppData,
        }
      );

      if (!modelExists) {
        const comfyExists = await exists(
          "comfyui/ComfyUI/models/checkpoints/put_checkpoints_here",
          {
            dir: BaseDirectory.AppData,
          }
        );

        if (!comfyExists) {
          setIsSetup(SetupState.NotStarted);
          setMessage("Installing ComfyUI...");
        } else {
          setIsSetup(SetupState.ComfyInstalled);
          setMessage("Downloading Stable Diffusion...");
        }
      } else {
        setIsSetup(SetupState.WeightsInstalled);
      }
    };

    useEffect(() => {
      check();
    }, []);

    return { isSetup, message, progress };
  };
}

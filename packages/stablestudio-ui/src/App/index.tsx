import { listen } from "@tauri-apps/api/event";
import {
  BaseDirectory,
  exists,
  FileEntry,
  readDir,
  removeFile,
} from "@tauri-apps/api/fs";
import { appDataDir } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/tauri";
import { download } from "tauri-plugin-upload";
import { shallow } from "zustand/shallow";
import { Comfy } from "~/Comfy";
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
          {isSetup !== App.SetupState.ComfyRunning ? (
            <>
              <div className="flex flex-grow flex-col items-center justify-center gap-16">
                <h1 className="text-6xl font-bold">Welcome to StableStudio</h1>
                <div className="flex w-full flex-col items-center gap-4">
                  <p className="font-mono opacity-75">{message}</p>
                  {typeof progress === "number" && (
                    <Theme.Progress
                      className="max-w-[25rem]"
                      value={progress * 100}
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <Shortcut.Palette />
              <TopBar />
              <Sidebars />
              <div className="flex min-h-0 grow overflow-auto sm:min-w-[1000px]">
                <Sidebar position="left" />
                <div className="relative shrink grow overflow-y-auto">
                  <Router />
                  <Comfy />
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
    ComfyRunning,
  }

  export async function listAppDataDir(path: string) {
    try {
      if (
        await exists(path, {
          dir: BaseDirectory.AppData,
        })
      ) {
        return (
          (await readDir(path, {
            dir: BaseDirectory.AppData,
          })) ?? []
        );
      }
    } catch (error) {
      console.error(error);
      return [];
    }

    return [];
  }

  export const useSetupState = () => {
    const [isSetup, setIsSetup] = useState<SetupState>(SetupState.NotStarted);
    const [message, setMessage] = useState<string>("");
    const [progress, setProgress] = useState<number | null>(null);
    const [setUnlisteners, print] = Comfy.use(
      (state) => [state.setUnlisteners, state.print],
      shallow
    );
    const nonce = useRef<number>(0);

    const check = useCallback(async () => {
      if (isSetup !== SetupState.NotStarted || nonce.current !== 0) return;
      nonce.current++;

      const appDataPath = await appDataDir();
      const comfyui_location = await invoke("get_setting", {
        key: "comfyui_location",
      })
        .then((res) => res)
        .catch(() => appDataPath);

      let entries: FileEntry[] = await listAppDataDir(
        `${comfyui_location}/ComfyUI/ComfyUI/models/checkpoints`
      );

      // filter for actual files (not directories or symlinks or "put_checkpoints_here" files)
      entries = entries.filter((entry) => entry.name?.includes("."));

      console.log(entries);

      if (entries.length === 0) {
        const comfyExists = await exists(
          `${comfyui_location}/ComfyUI/ComfyUI/main.py`
        );

        if (!comfyExists) {
          setIsSetup(SetupState.NotStarted);
          setMessage("Downloading ComfyUI...");

          // delete the old comfyui zip if it exists
          if (!(await exists(`${comfyui_location}/comfyui.zip`))) {
            let comulativeProgress = 0;

            console.log("downloading comfyui");

            await download(
              "https://pub-5e5adf378ed14628a527d735b7743e4e.r2.dev/stability-downloads/ComfyUI/ComfyUI_windows_portable.zip",
              `${comfyui_location}\\comfyui.zip`,
              (p, total) => {
                comulativeProgress += p;
                setProgress(comulativeProgress / total);
              }
            );
          }

          setMessage("Extracting ComfyUI...");
          setProgress(null);
          try {
            const result = await invoke("extract_comfy");

            if (result !== "completed") {
              throw new Error("Failed to extract comfyui.zip");
            }
          } catch (error) {
            console.error(error);
            setIsSetup(SetupState.NotStarted);
            setMessage(`Error installing ComfyUI: ${error}`);
            return;
          }

          await removeFile(`${comfyui_location}/comfyui.zip`);
        }

        setIsSetup(SetupState.ComfyInstalled);
        setMessage("Downloading Stable Diffusion...");

        let comulativeProgress = 0;

        console.log("downloading weights");

        await download(
          "https://huggingface.co/stabilityai/stable-diffusion-2-1/resolve/main/v2-1_768-ema-pruned.safetensors",
          `${comfyui_location}/ComfyUI/ComfyUI/models/checkpoints/v2-1_768-ema-pruned.safetensors`,
          (p, total) => {
            comulativeProgress += p;
            setProgress(comulativeProgress / total);
          }
        );

        setMessage("done");
      }

      setIsSetup(SetupState.WeightsInstalled);
      setMessage("Starting ComfyUI...");
      setProgress(null);

      // add listener
      const unlisten = await listen("comfy-output", (event) => {
        const [t, ...d] = `${event.payload}`.split(":");
        console.log("[COMFYUI]", t, d);
        print(t, d.join(":"));
      });
      setUnlisteners([unlisten]);

      // start comfy
      const result = await invoke("launch_comfy");

      if (result !== "completed") {
        setMessage(`Error launching ComfyUI: ${result}`);
        throw new Error("Failed to launch ComfyUI");
      }

      setIsSetup(SetupState.ComfyRunning);
      Comfy.registerListeners();
    }, [isSetup, print, setUnlisteners]);

    useEffect(() => {
      check();
    }, [check]);

    return { isSetup, message, progress };
  };
}

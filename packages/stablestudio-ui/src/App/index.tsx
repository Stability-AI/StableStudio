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
                  <Theme.Progress
                    className="max-w-[25rem]"
                    value={progress * 100}
                  />
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
    const [progress, setProgress] = useState<number>(0);
    const nonce = useRef<number>(0);

    const check = useCallback(async () => {
      if (isSetup !== SetupState.NotStarted || nonce.current !== 0) return;
      nonce.current++;

      let entries: FileEntry[] = await listAppDataDir(
        "comfyui/ComfyUI/models/checkpoints"
      );

      // filter for actual files (not directories or symlinks or "put_checkpoints_here" files)
      entries = entries.filter((entry) => entry.name?.includes("."));

      console.log(entries);
      const appDataPath = await appDataDir();

      if (entries.length === 0) {
        const comfyExists = await exists("comdyui/ComfyUI/main.py", {
          dir: BaseDirectory.AppData,
        });

        if (!comfyExists) {
          setIsSetup(SetupState.NotStarted);
          setMessage("Installing ComfyUI...");

          // delete the old comfyui zip if it exists
          if (
            !(await exists("comfyui.zip", {
              dir: BaseDirectory.AppData,
            }))
          ) {
            let comulativeProgress = 0;

            console.log("downloading comfyui");

            await download(
              "https://pub-5e5adf378ed14628a527d735b7743e4e.r2.dev/stability-downloads/ComfyUI/ComfyUI_windows_portable.zip",
              `${appDataPath}\\comfyui.zip`,
              (p, total) => {
                comulativeProgress += p;
                setProgress(comulativeProgress / total);
              }
            );
          }

          setMessage("Extracting ComfyUI...");
          try {
            const result = await invoke("extract_zip", {
              path: `${appDataPath}/comfyui.zip`,
              targetDir: `${appDataPath}`,
            });

            if (result !== "completed") {
              throw new Error("Failed to extract comfyui.zip");
            }
          } catch (error) {
            console.error(error);
            setIsSetup(SetupState.NotStarted);
            setMessage(`Error installing ComfyUI: ${error}`);
            return;
          }

          await removeFile("comfyui.zip", {
            dir: BaseDirectory.AppData,
          });
        }

        setIsSetup(SetupState.ComfyInstalled);
        setMessage("Downloading Stable Diffusion...");

        let comulativeProgress = 0;

        console.log("downloading weights");

        await download(
          "https://huggingface.co/stabilityai/stable-diffusion-2-1/resolve/main/v2-1_768-ema-pruned.safetensors",
          `${appDataPath}/comfyui/ComfyUI/models/checkpoints/v2-1_768-ema-pruned.safetensors`,
          (p, total) => {
            comulativeProgress += p;
            setProgress(comulativeProgress / total);
          }
        );

        setMessage("done");
      }

      setIsSetup(SetupState.WeightsInstalled);
      setMessage("Starting ComfyUI...");

      // start comfy
      const result = await invoke("launch_comfy", {
        path: `${appDataPath}/comfyui`,
      });

      if (result !== "completed") {
        setMessage(`Error launching ComfyUI: ${result}`);
        throw new Error("Failed to launch ComfyUI");
      }

      setIsSetup(SetupState.ComfyRunning);
    }, [isSetup]);

    useEffect(() => {
      check();
    }, [check]);

    return { isSetup, message, progress };
  };
}

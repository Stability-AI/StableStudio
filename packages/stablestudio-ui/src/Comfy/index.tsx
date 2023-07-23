import * as StableStudio from "@stability/stablestudio-plugin";
import { useLocation } from "react-router-dom";
import { create } from "zustand";
import { shallow } from "zustand/shallow";
import { Generation } from "~/Generation";

export type ComfyApp = {
  setup: () => void;
  registerNodes: () => void;
  loadGraphData: (graph: Graph) => void;
  graphToPrompt: () => Promise<{
    workflow: any;
    prompt: any;
  }>;
  handleFile: (file: File) => void;
  refreshComboInNodes: () => Promise<void>;
  queuePrompt: (number: number, batchCount: number) => Promise<void>;
  clean: () => void;
  api: ComfyAPI;
  graph: {
    _nodes: {
      title: string;
      type: string;
      stableValues?: any;
      widgets: {
        name: string;
        type: string;
        value: any;
      }[];
    }[];
  };
};

export type ComfyAPI = {
  addEventListener: (event: string, callback: (detail: any) => void) => void;
};

export type ComfyOutput = {
  images: {
    filename: string;
    subfolder: string;
    type: string;
  }[];
};

export type Graph = {
  last_node_id: number;
  last_link_id: number;
  nodes: {
    id: number;
    type: string;
    pos: [number, number];
    size: {
      0: number;
      1: number;
    };
    flags: Record<string, unknown>;
    order: number;
    mode: number;
    inputs: {
      name: string;
      type: string;
      link: number;
    }[];
    outputs: {
      name: string;
      type: string;
      links: number[];
      slot_index: number;
    }[];
    properties: Record<string, unknown>;
    widgets_values: any[];
  }[];
  links: [
    number, // id
    number, // input_node_id
    number, // input_slot_index
    number, // output_node_id
    number, // output_slot_index
    string // type
  ][];
  groups: any;
  config: any;
  extra: any;
  version: number;
};

export function Comfy() {
  const location = useLocation();

  return (
    <iframe
      id="comfyui-window"
      src="/comfyui"
      className={classes(
        "absolute h-full w-full",
        !location.pathname.startsWith("/nodes") &&
          "pointer-events-none h-0 w-0 opacity-0"
      )}
    />
  );
}

const MAX_STDOUT_LENGTH = 500;

type State = {
  output: {
    type: string;
    data: string;
  }[];
  max_lines: number;
  print: (type: string, data: string) => void;

  running: boolean;
  setRunning: (running: boolean) => void;

  unlisteners: (() => void)[];
  setUnlisteners: (unlisteners: (() => void)[]) => void;

  runningPrompt: ID | null;
  setRunningPrompt: (promptID: ID | null) => void;

  lastOuput: ComfyOutput | null;
  setLastOutput: (output: ComfyOutput | null) => void;
};

export namespace Comfy {
  export const get = (): ComfyApp | null =>
    ((
      (document.getElementById("comfyui-window") as HTMLIFrameElement)
        ?.contentWindow as Window & { app: ComfyApp }
    )?.app as ComfyApp) ?? null;

  export const use = create<State>((set) => ({
    output: [],
    max_lines: MAX_STDOUT_LENGTH,
    print: (type, data) =>
      set((state) => {
        if (state.output.map((o) => o.data).includes(data)) return state;

        const output = [...state.output, { type, data }];
        if (output.length > MAX_STDOUT_LENGTH) output.shift();
        return { output };
      }),

    running: false,
    setRunning: (running) => set({ running }),

    unlisteners: [],
    setUnlisteners: (unlisteners) => set({ unlisteners }),

    runningPrompt: null,
    setRunningPrompt: (runningPrompt) => set({ runningPrompt }),

    lastOuput: null,
    setLastOutput: (lastOuput) => set({ lastOuput }),
  }));

  export const registerListeners = async () => {
    let api = get()?.api;

    while (!api) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      api = get()?.api;
    }

    api.addEventListener("progress", ({ detail }) => {
      console.log("progress", detail);
      const runningPrompt = use.getState().runningPrompt;
      if (runningPrompt) {
        Generation.Image.Output.set({
          ...Generation.Image.Output.get(runningPrompt),
          progress: detail.value / detail.max,
        });
      }
    });

    api.addEventListener("b_preview", ({ detail }) => {
      console.log("b_preview", detail);
    });

    const executed = async ({ detail }: any) => {
      const { output, prompt_id } = detail;

      console.log("executed_in_comfy_domain", detail);
      use.getState().setRunningPrompt(null);

      const newInputs: Record<ID, Generation.Image.Input> = {};
      const responses: Generation.Images = [];

      const input = Generation.Image.Input.get(prompt_id);

      const images = await Promise.all(
        (output as ComfyOutput).images.map(async (image) => {
          console.log("image", image);
          const resp = await fetch(
            `/view?filename=${image.filename}&subfolder=${
              image.subfolder || ""
            }&type=${image.type}`,
            {
              cache: "no-cache",
            }
          );

          const blob = await resp.blob();
          const url = URL.createObjectURL(blob);
          console.log("url", url);

          const output = Generation.Image.Output.get(prompt_id);

          return {
            id: ID.create(),
            blob,
            inputID: output?.inputID ?? "",
            createdAt: new Date(),
          };
        })
      );

      for (const image of images) {
        const inputID = ID.create();
        const newInput = {
          ...Generation.Image.Input.initial(inputID),
          ...input,
          seed: (input?.seed ?? 0) + images.indexOf(image),
          id: inputID,
        };

        const cropped = await cropImage(image, newInput);
        if (!cropped) continue;

        responses.push(cropped);
        newInputs[inputID] = newInput;
      }

      Generation.Image.Inputs.set({
        ...Generation.Image.Inputs.get(),
        ...newInputs,
      });
      responses.forEach(Generation.Image.add);
      Generation.Image.Output.received(prompt_id, responses);
      use.getState().setLastOutput(detail);
    };

    api.addEventListener("executed", executed);
    api.addEventListener("execution_cached", async ({ detail }) => {
      const last: any = use.getState().lastOuput;
      console.log("execution_cached", detail, last);
      if (
        use.getState().runningPrompt === detail.prompt_id &&
        detail.nodes.includes(last?.node) &&
        last.output
      ) {
        console.log("last", last);
        const d = { ...last, prompt_id: detail.prompt_id };
        await executed({ detail: d });
      }
    });

    api.addEventListener("execution_error", ({ detail }) => {
      console.log("execution_error", detail);
      Generation.Image.Output.clear(detail.prompt_id);
      use.getState().setRunningPrompt(null);
    });

    api.addEventListener("execution_start", ({ detail }) => {
      use.getState().setRunningPrompt(detail?.prompt_id);
    });

    console.log("registered ComfyUI listeners");
    use.getState().setRunning(true);
  };

  export const Output = () => {
    const output = Comfy.use(({ output }) => output, shallow);

    return (
      <div className="flex max-h-[25rem] flex-col-reverse overflow-y-auto whitespace-pre-wrap rounded bg-black/25 p-2 font-mono text-sm">
        {[...output].reverse().map((line, index) => (
          <p
            key={`${index}-${line}`}
            className={classes(
              "text-white",
              line.type === "stdout" && "text-green-200",
              line.type === "stderr" && "text-red-200"
            )}
          >
            {line.data}
          </p>
        ))}
      </div>
    );
  };
}

function cropImage(
  image: StableStudio.StableDiffusionImage,
  input: Generation.Image.Input
) {
  return new Promise<Generation.Image | void>((resolve) => {
    const id = image.id;
    const blob = image.blob;
    if (!blob || !id) return resolve();

    // crop image to box size
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = input.width;
    croppedCanvas.height = input.height;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const croppedCtx = croppedCanvas.getContext("2d")!;

    const img = new window.Image();
    img.src = URL.createObjectURL(blob);
    img.onload = () => {
      croppedCtx.drawImage(
        img,
        0,
        0,
        input.width,
        input.height,
        0,
        0,
        input.width,
        input.height
      );

      croppedCanvas.toBlob((blob) => {
        if (blob) {
          const objectURL = URL.createObjectURL(blob);
          resolve({
            id,
            inputID: input.id,
            created: new Date(),
            src: objectURL,
            finishReason: 0,
          });
        }
      });
    };
  });
}

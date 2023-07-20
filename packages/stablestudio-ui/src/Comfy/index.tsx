import { listen } from "@tauri-apps/api/event";
import { useLocation } from "react-router-dom";
import { create } from "zustand";

export type Comfy = {
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
  const { print } = Comfy.use();

  useEffect(() => {
    let mounted = true;
    const unlisteners = [] as (() => void)[];
    (async () => {
      if (mounted) {
        unlisteners.push(
          await listen("comfy-stdout", (event) => {
            console.log("stdout", `${event.payload}`);
            print("stdout", `${event.payload}`);
          })
        );
        unlisteners.push(
          await listen("comfy-stderr", (event) => {
            console.log("stderr", `${event.payload}`);
            print("stderr", `${event.payload}`);
          })
        );

        mounted = false;
      }
    })();

    return () => {
      mounted = false;

      for (const unlistener of unlisteners) unlistener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

const MAX_STDOUT_LENGTH = 35;

type State = {
  output: {
    type: "stdout" | "stderr";
    data: string;
  }[];
  max_lines: number;
  print: (type: "stdout" | "stderr", data: string) => void;
};

export namespace Comfy {
  export const get = (): Comfy | null =>
    ((
      (document.getElementById("comfyui-window") as HTMLIFrameElement)
        ?.contentWindow as Window & { app: Comfy }
    )?.app as Comfy) ?? null;

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
  }));
}

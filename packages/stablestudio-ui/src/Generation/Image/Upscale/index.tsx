export * from "./Upscales";

import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";

export type Upscaler = (typeof Generation.Image.Input.upscaleEngines)[number];

export namespace Upscale {
  export const preset = () => "esrgan-v1-x2plus" as Upscaler;

  export const getScale = (upscaler: Upscaler) => {
    if (upscaler.includes("x2")) return 2;
    if (upscaler.includes("x4")) return 4;
    if (upscaler.includes("x8")) return 8;
    return 1;
  };

  export const get = (): Upscaler => store.getState().upscaler;
  export const set = (upscaler: Upscaler) =>
    store.getState().setUpscaler(upscaler);

  export const use = () =>
    store(
      ({ upscaler, setUpscaler }) => [upscaler, setUpscaler] as const,
      GlobalState.shallow
    );
}

const store = GlobalState.create<{
  upscaler: Upscaler;
  setUpscaler: (upscaler: Upscaler) => void;
}>((set) => ({
  upscaler: Upscale.preset(),
  setUpscaler: (upscaler) => set({ upscaler }),
}));

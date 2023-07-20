import * as StableStudio from "@stability/stablestudio-plugin";

import { Comfy } from ".";

export const createPlugin = StableStudio.createPlugin<any>(({ set, get }) => ({
  manifest: {
    name: "ComfyUI Backend",
  },

  statusStuff: {
    indicator: "loading",
    text: "Starting",
  },

  createStableDiffusionImages: async () => {
    const comfy = Comfy.get();

    if (!comfy) {
      console.log(document.getElementById("comfyui-window"));
      throw new Error("ComfyUI is not loaded");
    }

    await comfy.queuePrompt(1, 1);

    const image = await fetch(`${window.location.origin}/DummyImage.png`);
    const blob = await image.blob();
    const createdAt = new Date();

    return {
      id: `${Math.random() * 10000000}`,
      images: [
        {
          id: `${Math.random() * 10000000}`,
          createdAt,
          blob,
        },
        {
          id: `${Math.random() * 10000000}`,
          createdAt,
          blob,
        },
        {
          id: `${Math.random() * 10000000}`,
          createdAt,
          blob,
        },
        {
          id: `${Math.random() * 10000000}`,
          createdAt,
          blob,
        },
      ],
    };
  },

  getStatus: () => {
    fetch("/comfyui", { cache: "no-cache" }).then((resp) => {
      set({
        statusStuff: {
          indicator: resp.ok ? "success" : "error",
          text: resp.ok ? "Running" : "Not Running",
        },
      });
    });

    return get().statusStuff;
  },
}));

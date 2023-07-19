import * as StableStudio from "@stability/stablestudio-plugin";

import { Comfy } from ".";

export const createPlugin = StableStudio.createPlugin(() => ({
  manifest: {
    name: "ComfyUI Backend",
    author: "StabilityAI",
    version: "0.0.1",
    license: "MIT",
    description: "An interface for generating images with ComfyUI",
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
    return {
      indicator: "success",
      text: "Ready",
    };
  },
}));

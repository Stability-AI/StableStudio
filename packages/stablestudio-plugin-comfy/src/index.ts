import * as StableStudio from "@stability/stablestudio-plugin";

export const createPlugin = StableStudio.createPlugin(() => ({
  manifest: {
    name: "ComfyUI Backend",
    author: "StabilityAI",
    version: "0.0.1",
    license: "MIT",
    description: "An interface for generating images with ComfyUI",
  },

  createStableDiffusionImages: async () => {
    (
      (document.getElementById("comfyui-window") as any)?.contentWindow as any
    )?.app.queuePrompt(1, 1);

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

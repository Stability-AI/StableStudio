import * as StableStudio from "@stability/stablestudio-plugin";

export const createPlugin = StableStudio.createPlugin<any>(({ set, get }) => {
  return {
    manifest: {
      name: "ComfyUI Backend",
    },

    statusStuff: {
      indicator: "loading",
      text: "Starting",
    },

    // createStableDiffusionImages: async () => {
    //   const comfy = Comfy.get();

    //   if (!comfy) {
    //     console.log(document.getElementById("comfyui-window"));
    //     throw new Error("ComfyUI is not loaded");
    //   }

    //   await comfy.queuePrompt(1, 1);

    //   const p = new Promise((resolve, reject) => {

    //   });

    //   const image = await fetch(`${window.location.origin}/DummyImage.png`);
    //   const blob = await image.blob();
    //   const createdAt = new Date();

    //   return {
    //     id: `${Math.random() * 10000000}`,
    //     images: [
    //       {
    //         id: `${Math.random() * 10000000}`,
    //         createdAt,
    //         blob,
    //       },
    //       {
    //         id: `${Math.random() * 10000000}`,
    //         createdAt,
    //         blob,
    //       },
    //       {
    //         id: `${Math.random() * 10000000}`,
    //         createdAt,
    //         blob,
    //       },
    //       {
    //         id: `${Math.random() * 10000000}`,
    //         createdAt,
    //         blob,
    //       },
    //     ],
    //   };
    // },

    getStableDiffusionModels: async () => {
      const resp = await fetch("/object_info/CheckpointLoader", {
        cache: "no-cache",
      });
      const jsonResp = await resp.json();

      console.log(jsonResp);

      return jsonResp?.CheckpointLoader?.input?.required?.ckpt_name?.[0]?.map(
        (fileName: string) => ({
          id: fileName,
          name: fileName,
        })
      );
    },

    getStableDiffusionSamplers: async () => {
      const resp = await fetch("/object_info/KSamplerAdvanced", {
        cache: "no-cache",
      });
      const jsonResp = await resp.json();

      return jsonResp?.KSamplerAdvanced?.input?.required?.sampler_name?.[0]?.map(
        (name: string) => ({
          id: name,
          name: name
            .replace(/_/g, " ")
            .replace("ddim", "DDIM")
            .replace("lms", "LMS")
            .replace("dpm", "DPM")
            .replace("pp", "PP")
            .replace("sde", "SDE")
            .replace("2m", "2M")
            .replace("2s", "2S")
            .replace("gpu", "GPU")
            .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())),
        })
      );
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
  };
});

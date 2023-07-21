import * as StableStudio from "@stability/stablestudio-plugin";

export const createPlugin = StableStudio.createPlugin(() => {
  return {
    manifest: {
      name: "ComfyUI",
    },

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

    getStatus: async () => {
      const resp = await fetch("/comfyui", { cache: "no-cache" });
      return {
        indicator: resp.ok ? "success" : "error",
        text: resp.ok ? "Running" : "Not Running",
      };
    },
  };
});

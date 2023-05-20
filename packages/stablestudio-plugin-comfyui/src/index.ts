import * as StableStudio from "@stability/stablestudio-plugin";
import { GlobalState } from "@stability/stablestudio-ui/src/GlobalState";

const basicWorkflow = (
  prompt: string,
  negative_prompt: string,
  model: string,
  width: number,
  height: number,
  seed: number,
  steps: number,
  sampler: string,
  cfgScale: number
) => {
  return {
    "3": {
      class_type: "KSampler",
      inputs: {
        cfg: cfgScale,
        denoise: 1,
        latent_image: ["5", 0],
        model: ["4", 0],
        negative: ["7", 0],
        positive: ["6", 0],
        sampler_name: sampler,
        scheduler: "normal",
        seed: seed,
        steps: steps,
      },
    },
    "4": {
      class_type: "CheckpointLoaderSimple",
      inputs: {
        ckpt_name: model,
      },
    },
    "5": {
      class_type: "EmptyLatentImage",
      inputs: {
        batch_size: 1,
        height: height,
        width: width,
      },
    },
    "6": {
      class_type: "CLIPTextEncode",
      inputs: {
        clip: ["4", 1],
        text: prompt,
      },
    },
    "7": {
      class_type: "CLIPTextEncode",
      inputs: {
        clip: ["4", 1],
        text: negative_prompt,
      },
    },
    "8": {
      class_type: "VAEDecode",
      inputs: {
        samples: ["3", 0],
        vae: ["4", 2],
      },
    },
    "9": {
      class_type: "SaveImage",
      inputs: {
        filename_prefix: "ComfyUI",
        images: ["8", 0],
      },
    },
  };
};

const getModels = async (apiUrl: string) => {
  const response = await fetch(`${apiUrl}/checkpoints`);
  if (response.ok) {
    const json = await response.json();
    return json;
  } else {
    return [];
  }
};

const getSamplers = async (apiUrl: string) => {
  const response = await fetch(`${apiUrl}/samplers`);
  if (response.ok) {
    const json = await response.json();
    return json;
  } else {
    return [];
  }
};

const getQueue = async (apiUrl: string) => {
  const response = await fetch(`${apiUrl}/queue`);
  if (response.ok) {
    const json = await response.json();
    return {
      pending: json.queue_pending.length,
      running: json.queue_running.length,
    };
  } else {
    return {
      pending: 0,
      running: 0,
    };
  }
};

const postQueue = async (apiUrl: string, data: any) => {
  const response = await fetch(`${apiUrl}/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: data }),
  });
  if (response.ok) {
    const json = await response.json();
    return {
      promptId: json.prompt_id,
    };
  } else {
    return {
      error: "Error",
    };
  }
};

const promptIdToImage = async (
  apiUrl: string,
  promptId: string,
  input: StableStudio.StableDiffusionInput
) => {
  const response = await fetch(`${apiUrl}/history`);
  if (response.ok) {
    let json = await response.json();
    if (json.hasOwnProperty(promptId)) {
      const prompt = json[promptId]["outputs"][9]["images"];
      const images = [];
      for (const image of prompt) {
        images.push({
          id: `${Math.random() * 10000000}`,
          createdAt: new Date(),
          blob: await fetch(
            `${apiUrl}/view?filename=${image["filename"]}&subfolder=${image["subfolder"]}&type=output`
          ).then((r) => r.blob()),
          input: input,
        } as StableStudio.StableDiffusionImage);
      }
      console.log(images);
      return images;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
};

const getDefaultInput = () => ({
  width: 512,
  height: 512,

  cfgScale: 7,
  steps: 30,
  sampler: { id: "0", name: "euler" },
  model: "0",//hack to select first model from list
  seed: 69,
});

export const createPlugin = StableStudio.createPlugin<{
  settings: {
    apiUrl: StableStudio.PluginSettingString;
  };
}>(({ get, set }) => ({
  manifest: {
    name: "ComfyUI",
    author: "hlky",
    link: "https://github.com/comfyanonymous/ComfyUI",
    icon: `${window.location.origin}/DummyImage.png`,
    version: "0.0.1",
    license: "MIT",
    description: "ComfyUI plugin for StableStudio",
  },
  getStableDiffusionSamplers: async () => {
    return await getSamplers(get().settings.apiUrl.value as string).then(
      (samplers) =>
        samplers.map((s: string) => ({
          id: `${samplers.indexOf(s)}`,
          name: s,
        }))
    );
  },

  getStableDiffusionModels: async () => {
    const models = getModels(get().settings.apiUrl.value as string).then(
      (models) =>
        models.map((model: string) => ({
          id: `${models.indexOf(model)}`,
          name: model,
        }))
    );
    return models;
  },

  createStableDiffusionImages: async (options) => {
    const apiUrl = get().settings.apiUrl.value as string;
    const models = await getModels(apiUrl);
    const model = models[options?.input?.model as string];
    const defaultStableDiffusionInput = getDefaultInput();
    const input = {
      ...defaultStableDiffusionInput,
      ...options?.input,
    };
    input.model = model;
    input.seed = input.seed ?? 69;
    if (!input.model) {
      return undefined;
    }
    
    const prompt =
      input.prompts
        ?.filter((p) => p.weight && p.weight > 0)
        .map((p) => `(${p.text}:${p.weight})`)
        .join(" ") ?? "";
    const negative_prompt =
      input.prompts
        ?.filter((p) => p.weight && p.weight < 0)
        .map((p) => `(${p.text}:${p.weight})`)
        .join(" ") ?? "text";

    const width = input.width ?? 512;
    const height = input.height ?? 512;
    const seed = input.seed ?? 69;
    const steps = input.steps ?? 30;
    const sampler = input.sampler?.name ?? "euler";
    const cfgScale = input.cfgScale ?? 8;
    const workflow = basicWorkflow(
      prompt,
      negative_prompt,
      model,
      width,
      height,
      seed,
      steps,
      sampler,
      cfgScale
    );

    const promptId = await postQueue(apiUrl, workflow);
    if (promptId.error) {
      return undefined;
    }
    let images = await promptIdToImage(
      apiUrl,
      promptId.promptId,
     input,
    );
    while (images === undefined) {
      await new Promise((r) => setTimeout(r, 1000));
      images = await promptIdToImage(
        apiUrl,
        promptId.promptId,
        input,
      );
    }
    return { id: "", images: images };
  },

  getStatus: async () => {
    const apiUrl = get().settings.apiUrl.value;
    if (!apiUrl) {
      return {
        indicator: "error",
        text: "API URL not set",
      };
    } else {
      const queue = await getQueue(apiUrl);
      return {
        indicator: "success",
        text:
          "Queue: " + queue.pending + " pending, " + queue.running + " running",
      };
    }
  },

  getStableDiffusionDefaultCount: () => 1,

  getStableDiffusionDefaultInput: () => getDefaultInput(),

  settings: {
    apiUrl: {
      type: "string" as const,
      default: "http://127.0.0.1:8188",
      placeholder: "API URL",
      required: true,
      value: "http://127.0.0.1:8188",
    },
  },

  setSetting: (key, value) =>
    set(({ settings }) => ({
      settings: {
        [key]: { ...settings[key], value: value as string },
      },
    })),
}));

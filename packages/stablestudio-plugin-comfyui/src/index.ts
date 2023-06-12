import * as StableStudio from "@stability/stablestudio-plugin";

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

const basicWorkflowImage = (
  prompt: string,
  negative_prompt: string,
  model: string,
  seed: number,
  steps: number,
  sampler: string,
  cfgScale: number,
  imageFilename: string,
  imageStrength: number
) => {
  imageStrength = Math.max(0, Math.min(0.99, imageStrength));
  return {
    "3": {
      class_type: "KSampler",
      inputs: {
        cfg: cfgScale,
        denoise: 1 - imageStrength,
        latent_image: ["11", 0],
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
    "10": {
      class_type: "LoadImage",
      inputs: {
        image: imageFilename,
        "choose file to upload": "image",
      },
    },
    "11": {
      class_type: "VAEEncode",
      inputs: {
        pixels: ["10", 0],
        vae: ["4", 2],
      },
    },
  };
};

const basicWorkflowInpaint = (
  prompt: string,
  negative_prompt: string,
  model: string,
  seed: number,
  steps: number,
  sampler: string,
  cfgScale: number,
  imageFilename: string,
  imageStrength: number,
  maskFilename: string
) => {
  imageStrength = Math.max(0, Math.min(0.99, imageStrength));
  return {
    "3": {
      class_type: "KSampler",
      inputs: {
        cfg: cfgScale,
        denoise: 1 - imageStrength,
        latent_image: ["17", 0],
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
    "10": {
      class_type: "LoadImage",
      inputs: {
        image: imageFilename,
        "choose file to upload": "image",
      },
    },
    "17": {
      class_type: "VAEEncodeForInpaint",
      inputs: {
        grow_mask_by: 0,
        mask: ["21", 0],
        pixels: ["10", 0],
        vae: ["4", 2],
      },
    },
    "20": {
      class_type: "LoadImageMask",
      inputs: {
        channel: "red",
        "choose file to upload": "image",
        image: maskFilename,
      },
    },
    "21": {
      class_type: "InvertMask",
      inputs: {
        mask: ["20", 0],
      },
    },
  };
};

const getExtras = () => {
  const extras: StableStudio.StableDiffusionExtra[] = [];
  const lora: StableStudio.StableDiffusionExtra = {
    name: "Lora",
    description: "Load LoRA to model",
    type: "select",
    data: {
      type: "list",
      data: ["lora1", "lora2", "lora3"],
      default: "lora2",
    },
  };
  const aitemplate: StableStudio.StableDiffusionExtra = {
    name: "AITemplate",
    description: "Accelerate inference with AITemplate",
    type: "boolean",
    data: {
      type: "boolean",
      default: false,
      data: false,
    },
  };
  const randomSlider: StableStudio.StableDiffusionExtra = {
    name: "RandomSlider",
    description: "Randomize the slider",
    type: "slider",
    data: {
      type: "slider",
      default: 0,
      data: 50,
      min: 0,
      max: 100,
      step: 1,
    },
  };
  extras.push(lora);
  extras.push(aitemplate);
  extras.push(randomSlider);
  return extras;
};

const getModels = async (apiUrl: string) => {
  const response = await fetch(`${apiUrl}/object_info`);
  if (response.ok) {
    const json = await response.json();
    return json.CheckpointLoaderSimple.input.required.ckpt_name[0];
  } else {
    return [];
  }
};

const getSamplers = async (apiUrl: string) => {
  const response = await fetch(`${apiUrl}/object_info`);
  if (response.ok) {
    const json = await response.json();
    return json.KSampler.input.required.sampler_name[0];
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

const uploadImage = async (apiUrl: string, image: Blob, filename: string) => {
  const blob = new Blob([image], { type: "image/png" });
  const formData = new FormData();
  formData.append("image", blob, filename);
  const response = await fetch(`${apiUrl}/upload/image`, {
    method: "POST",
    body: formData,
  });
  if (response.ok) {
    const json = await response.json();
    return {
      name: json.name,
      subfolder: json.subfolder,
      type: json.type,
    };
  } else {
    return {
      error: "Error",
    };
  }
};

const randomFilename = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const randomSeed = () => {
  return Math.floor(Math.random() * 1000000000);
};

const getDefaultInput = () => ({
  width: 512,
  height: 512,

  cfgScale: 7,
  steps: 30,
  sampler: { id: "0", name: "euler" },
  model: "0", //hack to select first model from list
  strength: 0.75,
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
    const count = options?.count ?? 1;
    const apiUrl = get().settings.apiUrl.value as string;
    const models = await getModels(apiUrl);
    const model = models[options?.input?.model as string];
    const defaultStableDiffusionInput = getDefaultInput();
    const input = {
      ...defaultStableDiffusionInput,
      ...options?.input,
    };
    input.model = model;
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
    const seed = input.seed === 0 ? randomSeed() : input.seed ?? randomSeed();
    const steps = input.steps ?? 30;
    const sampler = input.sampler?.name ?? "euler";
    const cfgScale = input.cfgScale ?? 8;
    let workflow: any = basicWorkflow(
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
    const initImageFilename = `${randomFilename()}.png`;
    const maskImageFilename = `${randomFilename()}.png`;
    if (input.initialImage) {
      const image = await uploadImage(
        apiUrl,
        input.initialImage.blob!,
        initImageFilename
      );
      if (image.error) {
        return undefined;
      }
      workflow = basicWorkflowImage(
        prompt,
        negative_prompt,
        model,
        seed,
        steps,
        sampler,
        cfgScale,
        initImageFilename,
        input.initialImage.weight ?? 0.75
      );
    }
    if (input.maskImage) {
      const image = await uploadImage(
        apiUrl,
        input.maskImage.blob!,
        maskImageFilename
      );
      if (image.error) {
        return undefined;
      }
      workflow = basicWorkflowInpaint(
        prompt,
        negative_prompt,
        model,
        seed,
        steps,
        sampler,
        cfgScale,
        initImageFilename,
        input.initialImage!.weight ?? 0.75,
        maskImageFilename
      );
    }
    let promptIds = [];
    let images: StableStudio.StableDiffusionImages = { id: "", images: [] };
    //messy, would be nicer to return images as they are ready
    for (let i = 0; i < count; i++) {
      workflow["3"].inputs.seed = seed + i;
      const promptId = await postQueue(apiUrl, workflow);
      if (!promptId) {
        return undefined;
      }

      promptIds.push(promptId);
    }
    for (let i = 0; i < count; i++) {
      const promptId = promptIds[i].promptId;
      let image = await promptIdToImage(apiUrl, promptId, {
        ...input,
        seed: seed + i,
      });
      while (image === undefined) {
        await new Promise((r) => setTimeout(r, 1000));
        image = await promptIdToImage(apiUrl, promptId, {
          ...input,
          seed: seed + i,
        });
      }
      images.images!.push(image[0]);
    }

    return images;
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

  getStableDiffusionExtras: () => getExtras(),

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

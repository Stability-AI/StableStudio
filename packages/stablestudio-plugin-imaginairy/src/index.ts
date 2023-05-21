import * as StableStudio from "@stability/stablestudio-plugin";

const defaultApiUrl = "http://127.0.0.1:8000/api/stablestudio";

export const createPlugin = StableStudio.createPlugin<{
  imagesGeneratedSoFar: number;
  settings: {
    apiUrl: StableStudio.PluginSettingString;
  };
}>(({ set, get }) => ({
  imagesGeneratedSoFar: 0,

  manifest: {
    name: "imaginAIry Local Diffusion Plugin",
    author: "Bryce Drennan",
    link: "https://github.com/brycedrennan/imaginAIry",
    icon: `${window.location.origin}/DummyImage.png`,
    version: "0.0.1",
    license: "MIT",
    description: "Generate images using imaginAIry.",
  },

  createStableDiffusionImages: async (options) => {
    console.log(options);
    // const image = await fetch(`${window.location.origin}/DummyImage.png`);

    set(({ imagesGeneratedSoFar }) => ({
      imagesGeneratedSoFar: imagesGeneratedSoFar + 4,
    }));

    const apiUrl = get().settings.apiUrl.value ?? defaultApiUrl;

    const response = await fetch(apiUrl + "/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: await jsonifyOptions(options),
    });
    const json = await response.json();
    console.log(json);

    type Image = {
      id: string;
      createdAt: string;
      blob: string; // Or Blob if it's a binary blob
    };

    // Process the response from the server
    const images = json.images.map((image: Image) => {
      const blob = base64ToBlob(image.blob, "image/jpeg");

      return {
        id: image.id,
        createdAt: new Date(image.createdAt),
        blob: blob,
      };
    });

    return {
      id: `${Math.random() * 10000000}`,
      images: images,
    };
  },
  getStableDiffusionModels: async () => {
    const apiUrl = get().settings.apiUrl.value ?? defaultApiUrl;
    const response = await fetch(apiUrl + "/models");
    return await response.json();
  },
  getStableDiffusionSamplers: async () => {
    const apiUrl = get().settings.apiUrl.value ?? defaultApiUrl;
    const response = await fetch(apiUrl + "/samplers");
    return await response.json();
  },
  getStableDiffusionDefaultCount: () => 1,
  getStableDiffusionDefaultInput: () => {
    console.log("getStableDiffusionDefaultInput");
    return {
      steps: 16,
      sampler: {
        id: "k_dpmpp_2m",
        name: "k_dpmpp_2m",
      },
      model: "SD-1.5",
    };
  },
  getStatus: () => {
    const { imagesGeneratedSoFar } = get();
    return {
      indicator: "success",
      text:
        imagesGeneratedSoFar > 0
          ? `${imagesGeneratedSoFar} images generated`
          : "Ready",
    };
  },

  settings: {
    apiUrl: {
      type: "string" as const,
      default: "",
      placeholder: "URL to imaginAIry API",
      value: localStorage.getItem("imaginairy-apiUrl") ?? defaultApiUrl,
    },
  },

  setSetting: (key, value) => {
    set(({ settings }) => ({
      settings: {
        [key]: { ...settings[key], value: value as string },
      },
    }));
    const settingName = "imaginairy-" + key;
    console.log(settingName + " : " + value);
    localStorage.setItem(settingName, value as string);
  },
}));

function base64ToBlob(base64: string, contentType = ""): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      resolve(base64Data.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function jsonifyOptions(options: any): Promise<string> {
  // Deep copy of options
  const copiedOptions = JSON.parse(JSON.stringify(options));

  if (options?.input?.initialImage?.blob) {
    const initImgB64 = await blobToBase64(options.input.initialImage.blob);
    copiedOptions.input.initialImage.blob = initImgB64;
  }

  if (options?.input?.maskImage?.blob) {
    const maskImgB64 = await blobToBase64(options.input.maskImage.blob);
    copiedOptions.input.maskImage.blob = maskImgB64;
  }

  return JSON.stringify(copiedOptions);
}

import * as StableStudio from "@stability/stablestudio-plugin";
import { StableDiffusionImage } from "@stability/stablestudio-plugin";

import {
  base64ToBlob,
  constructPayload,
  fetchOptions,
  getImageInfo,
  setOptions,
  testForHistoryPlugin,
} from "./Utilities";

const manifest = {
  name: "stable-diffusion-webui",
  author: "Terry Jia",
  link: "https://github.com/jtydhr88",
  icon: `${window.location.origin}/DummyImage.png`,
  version: "0.0.0",
  license: "MIT",
  description:
    "This plugin uses [`stable-diffusion-webui`](https://github.com/AUTOMATIC1111/stable-diffusion-webui) as its back-end for inference",
};

const webuiUpscalers = [
  {
    label: "None",
    value: "None",
  },
  {
    label: "Lanczos",
    value: "Lanczos",
  },
  {
    label: "Nearest",
    value: "Nearest",
  },
  {
    label: "ESRGAN_4x",
    value: "ESRGAN_4x",
  },
  {
    label: "LDSR",
    value: "LDSR",
  },
  {
    label: "R-ESRGAN 4x+",
    value: "R-ESRGAN 4x+",
  },
  {
    label: "R-ESRGAN 4x+ Anime6B",
    value: "R-ESRGAN 4x+ Anime6B",
  },
  {
    label: "ScuNET GAN",
    value: "ScuNET GAN",
  },
  {
    label: "ScuNET PSNR",
    value: "ScuNET PSNR",
  },
  {
    label: "SwinIR_4x",
    value: "SwinIR_4x",
  },
];

const getNumber = (strValue: string | null, defaultValue: number) => {
  let retValue = defaultValue;

  if (strValue) {
    retValue = Number(strValue);
  }

  return retValue;
};

const getStableDiffusionDefaultCount = () => 4;
export const createPlugin = StableStudio.createPlugin<{
  settings: {
    baseUrl: StableStudio.PluginSettingString;
    upscaler: StableStudio.PluginSettingString;
    historyImagesCount: StableStudio.PluginSettingNumber;
  };
}>(({ set, get }) => {
  const webuiLoad = (
    webuiHostUrl?: string
  ): Pick<
    StableStudio.Plugin,
    | "createStableDiffusionImages"
    | "getStatus"
    | "getStableDiffusionModels"
    | "getStableDiffusionSamplers"
    | "getStableDiffusionDefaultCount"
    | "getStableDiffusionDefaultInput"
    | "getStableDiffusionExistingImages"
  > => {

    return {
      createStableDiffusionImages: async (options) => {
        if (!options) {
          throw new Error("options is required");
        }

        // fetch the current webui options (model/sampler/etc)
        const webUIOptions = await fetchOptions(webuiHostUrl);

        const { model, sampler, initialImage } = options?.input ?? {};
        options.count = options?.count ?? getStableDiffusionDefaultCount();

        // quickly save the sampler and model name to local storage
        if (sampler?.name) {
          localStorage.setItem("webui-saved-sampler", sampler.name);
        }

        if (model) {
          localStorage.setItem("webui-saved-model", model);
        }

        // little hacky until StableStudio is better with upscaling
        const isUpscale =
          options?.input?.initialImage?.weight === 1 &&
          model === "esrgan-v1-x2plus";

        // WebUI doesn't have the right model loaded, switch the model
        if (model && model !== webUIOptions.sd_model_checkpoint && !isUpscale) {
          localStorage.setItem("webui-saved-model", model);
          const modelResponse = await setOptions(webuiHostUrl, {
            sd_model_checkpoint: model,
          });

          if (modelResponse.ok) {
            console.log("applied model");
          }
        }

        // Construct payload for webui
        const data = await constructPayload(
          options,
          isUpscale,
          get().settings.upscaler.value
        );

        // Send payload to webui
        const response = await fetch(
          initialImage
            ? isUpscale
              ? `${webuiHostUrl}/sdapi/v1/extra-single-image`
              : `${webuiHostUrl}/sdapi/v1/img2img`
            : `${webuiHostUrl}/sdapi/v1/txt2img`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        const responseData = await response.json();

        const images = [];
        const createdAt = new Date();

        if (isUpscale) {
          // Upscaling only returns one image
          const blob = await base64ToBlob(responseData.image, "image/jpeg");

          const image = {
            id: `${Math.random() * 10000000}`,
            createdAt: createdAt,
            blob: blob,
            input: {
              model: model ?? "",
            },
          };

          images.push(image);
        } else {
          // Image generation returns an array of images
          const startIndex =
            responseData.images.length > data.batch_size ? 1 : 0;

          for (let i = startIndex; i < responseData.images.length; i++) {
            const blob = await base64ToBlob(
              responseData.images[i],
              "image/jpeg"
            );

            const image: StableDiffusionImage = {
              id: `${Math.random() * 10000000}`,
              createdAt,
              blob,
              input: {
                prompts: options?.input?.prompts ?? [],
                steps: options?.input?.steps ?? 0,
                seed: responseData.images[i].seed,
                model: model ?? "",
                width: options?.input?.width ?? 512,
                height: options?.input?.height ?? 512,
                cfgScale: options?.input?.cfgScale ?? 7,
                sampler: sampler ?? { id: "", name: "" },
              },
            };

            images.push(image);
          }
        }

        return {
          id: `${Math.random() * 10000000}`,
          images: images,
        };
      },

      getStableDiffusionModels: async () => {
        const response = await fetch(`${webuiHostUrl}/sdapi/v1/sd-models`);
        const responseData = await response.json();

        return responseData.map((model: any) => ({
          id: model.title,
          name: model.model_name,
        }));
      },

      getStatus: async () => {
        const optionsResponse = await fetch(`${webuiHostUrl}/sdapi/v1/options`);
        const hasWebuiHistoryPlugin = await testForHistoryPlugin(
          `${webuiHostUrl}`
        );

        return optionsResponse.ok
          ? {
              indicator: hasWebuiHistoryPlugin ? "success" : "info",
              text: `Ready ${
                hasWebuiHistoryPlugin ? "with" : "without"
              } history plugin`,
            }
          : {
              indicator: "error",
              text: "unable to connect webui on " + webuiHostUrl,
            };
      },
    };
  };

  let webuiHostUrl = localStorage.getItem("webui-host-url");

  if (!webuiHostUrl || webuiHostUrl === "") {
    webuiHostUrl = "http://127.0.0.1:7861";
  }

  return {
    ...webuiLoad(webuiHostUrl),

    getStableDiffusionDefaultCount: () => 4,

    getStableDiffusionDefaultInput: () => {
      return {
        steps: 20,
        sampler: {
          id: localStorage.getItem("webui-saved-sampler") ?? "",
          name: localStorage.getItem("webui-saved-sampler") ?? "",
        },
        model: localStorage.getItem("webui-saved-model") ?? "",
      };
    },

    getStableDiffusionSamplers: async () => {
      const response = await fetch(`${webuiHostUrl}/sdapi/v1/samplers`);
      const responseData = await response.json();

      return responseData.map((sampler: any) => ({
        id: sampler.name,
        name: sampler.name,
      }));
    },

    getStableDiffusionExistingImages: async () => {
      const existingImagesResponse = await fetch(
        `${webuiHostUrl}/StableStudio/get-generated-images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            limit: get().settings.historyImagesCount.value,
          }),
        }
      );

      if (!existingImagesResponse.ok) {
        console.warn("unable to get existing data from webui");
      }

      const responseData = await existingImagesResponse.json();

      const images = [];

      for (let i = 0; i < responseData.length; i++) {
        const imageInfo = await getImageInfo(
          webuiHostUrl,
          responseData[i].content
        );

        const blob = await base64ToBlob(responseData[i].content, "image/jpeg");

        const timestampInSeconds = responseData[i].create_date;
        const timestampInMilliseconds = timestampInSeconds * 1000;
        const createdAt = new Date(timestampInMilliseconds);

        const stableDiffusionImage = {
          id: responseData[i].image_name,
          createdAt: createdAt,
          blob: blob,
          input: {
            prompts: [
              {
                text: imageInfo["prompt"],
                weight: imageInfo["CFG scale"],
              },
            ],
            style: "",
            steps: Number(imageInfo["Steps"]) ?? -1,
            seed: Number(imageInfo["Seed"]) ?? -1,
            model: imageInfo["Model"] ?? "",
            width: responseData[i].width,
            height: responseData[i].height,
          },
        };

        images.push(stableDiffusionImage);
      }

      return [
        {
          id: `${Math.random() * 10000000}`,
          images: images,
        },
      ];
    },

    settings: {
      baseUrl: {
        type: "string",
        title: "Host URL",
        placeholder: "http://127.0.0.1:7861",
        value: localStorage.getItem("webui-host-url") ?? "",
        description:
          "The URL of the `stable-diffusion-webui` host, usually http://127.0.0.1:7861",
      },

      upscaler: {
        type: "string",
        title: "Upscaler 1",
        options: webuiUpscalers,
        value: localStorage.getItem("upscaler1") ?? webuiUpscalers[0].value,
        description:
          "Select the upscaler used when downloading images at more than 1x size",
      },

      historyImagesCount: {
        type: "number",
        title: "History image count",
        description: "How many images should be fetched from local history?",
        min: 0,
        max: 50,
        step: 1,
        variant: "slider",
        value: getNumber(localStorage.getItem("historyImagesCount"), 20),
      },
    },

    setSetting: (key, value) => {
      set(({ settings }) => ({
        settings: {
          ...settings,
          [key]: { ...settings[key], value: value as string },
        },
      }));

      if (key === "baseUrl" && typeof value === "string") {
        localStorage.setItem("webui-host-url", value);
        set((plugin) => ({ ...plugin, ...webuiLoad(value) }));
      } else if (key === "upscaler" && typeof value === "string") {
        localStorage.setItem("upscaler1", value);
      } else if (key === "historyImagesCount" && typeof value === "number") {
        localStorage.setItem("historyImagesCount", value.toString());
      }
    },

    manifest,
  };
});

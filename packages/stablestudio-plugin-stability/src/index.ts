import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { RpcError } from "@protobuf-ts/runtime-rpc";
import * as StableStudio from "@stability/stablestudio-plugin";

import {
  EnginesServiceClient,
  Generation,
  GenerationServiceClient,
  Project,
  ProjectServiceClient,
  Struct,
} from "./Proto";

const setApiKeyFromEnvVar = () => {
  const envApiKey = import.meta.env.VITE_STABILITY_APIKEY;

  const localStorageApiKey = localStorage.getItem("stability-apiKey");
  if (localStorageApiKey) return localStorageApiKey;

  if (envApiKey) {
    localStorage.setItem("stability-apiKey", envApiKey);
    return envApiKey;
  }

};

const getStableDiffusionDefaultCount = () => 4;
const getStableDiffusionDefaultInputFromPrompt = (prompt: string) => ({
  prompts: [
    {
      text: prompt,
      weight: 1,
    },

    {
      text: "",
      weight: -0.75,
    },
  ],

  model: "stable-diffusion-xl-beta-v2-2-2",
  sampler: { id: "0", name: "DDIM" },
  style: "enhance",

  width: 512,
  height: 512,

  cfgScale: 7,
  steps: 50,
});

export const createPlugin = StableStudio.createPlugin<{
  settings: {
    apiKey: StableStudio.PluginSettingString;
  };
}>(({ context, set }) => {
  const functionsWhichNeedAPIKey = (
    apiKey?: string
  ): Pick<
    StableStudio.Plugin,
    | "createStableDiffusionImages"
    | "getStableDiffusionExistingImages"
    | "getStableDiffusionModels"
    | "deleteStableDiffusionImages"
    | "getStatus"
    | "getStableDiffusionSamplers"
  > => {
    
    apiKey = setApiKeyFromEnvVar() || apiKey;

    if (!apiKey)



      return {
        createStableDiffusionImages: undefined,
        getStableDiffusionExistingImages: undefined,
        getStableDiffusionModels: undefined,
        deleteStableDiffusionImages: undefined,

        getStatus: () => ({
          indicator: "error",
          text: "Missing API key",
        }),
      };

    const transport = new GrpcWebFetchTransport({
      baseUrl: "https://grpc.stability.ai",
      meta: {
        Authorization: `Bearer ${apiKey}`,

        "stability-client-id": "StableStudio",
        "stability-client-version": context.getGitHash(),
      },
    });

    const generation = new GenerationServiceClient(transport);
    const engines = new EnginesServiceClient(transport);
    const project = new ProjectServiceClient(transport);

    return {
      createStableDiffusionImages: async (options) => {
        const count = options?.count ?? getStableDiffusionDefaultCount();
        const defaultStableDiffusionInput =
          getStableDiffusionDefaultInputFromPrompt(
            context.getStableDiffusionRandomPrompt()
          );

        const input = {
          ...defaultStableDiffusionInput,
          ...options?.input,
        };

        const width = input.width ?? defaultStableDiffusionInput.width;
        const height = input.height ?? defaultStableDiffusionInput.height;

        const prompt =
          input.prompts?.map(
            ({ text = context.getStableDiffusionRandomPrompt(), weight }) =>
              Generation.Prompt.create({
                prompt: { oneofKind: "text", text },
                parameters: { weight },
              })
          ) ?? [];

        // add init and mask
        if (input.maskImage?.blob) {
          prompt.push(
            Generation.Prompt.create({
              parameters: { init: false, weight: 1 },
              prompt: {
                oneofKind: "artifact",
                artifact: Generation.Artifact.create({
                  type: Generation.ArtifactType.ARTIFACT_MASK,
                  mime: "image/png",
                  data: {
                    oneofKind: "binary",
                    binary: new Uint8Array(
                      await input.maskImage.blob.arrayBuffer()
                    ),
                  },
                }),
              },
            })
          );
        }

        if (input.initialImage?.blob) {
          prompt.push(
            Generation.Prompt.create({
              parameters: { init: true, weight: input.initialImage.weight },
              prompt: {
                oneofKind: "artifact",
                artifact: Generation.Artifact.create({
                  type: Generation.ArtifactType.ARTIFACT_IMAGE,
                  mime: "image/png",
                  data: {
                    oneofKind: "binary",
                    binary: new Uint8Array(
                      await input.initialImage.blob.arrayBuffer()
                    ),
                  },
                }),
              },
            })
          );
        }

        console.log(input.sampler.id ? parseInt(input.sampler.id) : 0);

        const imageParams = Generation.ImageParameters.create({
          width: BigInt(width),
          height: BigInt(height),

          steps: BigInt(input.steps),
          samples: BigInt(count),
          seed: Array.from({ length: count }, () => input.seed ?? 0),

          transform: Generation.TransformType.create({
            type: {
              oneofKind: "diffusion",
              diffusion: input.sampler.id ? parseInt(input.sampler.id) : 0,
            },
          }),

          parameters: [
            Generation.StepParameter.create({
              sampler: Generation.SamplerParameters.create({
                cfgScale: input.cfgScale,
              }),

              scaledStep: 0,
              schedule: Generation.ScheduleParameters.create({
                start: input.initialImage
                  ? 1 - (input.initialImage.weight ?? 0)
                  : 1,
              }),
            }),
          ],
        });

        const extras = (input.style || input.width !== input.height) && {
          extras: Struct.fromJson({
            $IPC: {
              preset: input.style,
              ...(input.width !== input.height && { mode: "multistage" }),
            },
          }),
        };

        const request = generation.chainGenerate({
          requestId: "",
          stage: [
            {
              id: "Main",

              request: Generation.Request.create({
                prompt,

                engineId: input.model,
                requestedType: Generation.ArtifactType.ARTIFACT_IMAGE,
                params: { oneofKind: "image", image: imageParams },

                ...extras,
              }),

              onStatus: [
                {
                  target: "Asset",
                  reason: [],
                  action: [
                    Generation.StageAction.PASS,
                    Generation.StageAction.RETURN,
                  ],
                },
              ],
            },

            {
              id: "Asset",

              request: Generation.Request.create({
                engineId: "asset-service",
                params: {
                  oneofKind: "asset",
                  asset: {
                    projectId: "",
                    action: Generation.AssetAction.ASSET_PUT,
                    use: Generation.AssetUse.OUTPUT,
                  },
                },
              }),

              onStatus: [
                { action: [Generation.StageAction.RETURN], reason: [] },
              ],
            },
          ],
        });

        let id: string | undefined;
        const images: StableStudio.StableDiffusionImage[] = [];

        for await (const response of request.responses) {
          for (const artifact of response.artifacts) {
            if (
              artifact.type === Generation.ArtifactType.ARTIFACT_TEXT &&
              artifact.finishReason === Generation.FinishReason.FILTER
            )
              throw new RpcError("Banned word detected!", "BANNED_TERM");

            if (
              artifact.type === Generation.ArtifactType.ARTIFACT_IMAGE &&
              artifact.data.oneofKind === "binary"
            ) {
              id = response.requestId;
              images.push({
                input: {
                  ...input,
                  seed: artifact.seed,
                },
                id: artifact.uuid,
                blob: new Blob([artifact.data.binary], { type: "image/png" }),
              });
            }
          }
        }

        return id ? { id, images } : undefined;
      },

      getStableDiffusionExistingImages: async (options) => {
        const { limit, exclusiveStartImageID } = { limit: 25, ...options };
        if (limit <= 0) return [];

        const { response } = await project.queryAssets({
          id: "",
          limit: BigInt(limit),
          startKey: exclusiveStartImageID,
          use: [Project.ProjectAssetUse.OUTPUT],
          sortDir: Project.ProjectSortDir.DESC,
          tags: {},
        });

        type ImageWithBlobPromise = Omit<
          StableStudio.StableDiffusionImage,
          "blob"
        > & { blob: Promise<Blob> };

        type ImagesWithBlobPromises = Record<
          StableStudio.ID,
          Omit<StableStudio.StableDiffusionImages, "images"> & {
            images: ImageWithBlobPromise[];
          }
        >;

        const images = response.assets.reduce((previous, response) => {
          if (
            !response.request ||
            response.request.params.oneofKind !== "image"
          )
            return previous;

          const prompts = response.request.prompt.reduce((prompts, prompt) => {
            if (
              prompt.prompt.oneofKind !== "artifact" ||
              prompt.prompt.artifact.data.oneofKind !== "text"
            )
              return prompts;

            return [
              ...prompts,
              {
                text: prompt.prompt.artifact.data.text,
                weight: prompt.parameters?.weight ?? 1,
              },
            ];
          }, [] as StableStudio.StableDiffusionPrompt[]);

          if (prompts.length === 0) return previous;

          const id = response.request.requestId.split(":")[0];
          if (!id) return previous;

          const imageID = response.id;
          const createdAt = new Date(Number(response.createdAt) * 1000);

          const model = response.request.engineId;
          const style = parseExtras(response.request.extras?.fields).$IPC
            ?.preset;

          const width = response.request.params.image.width
            ? Number(response.request.params.image.width)
            : undefined;

          const height = response.request.params.image.height
            ? Number(response.request.params.image.height)
            : undefined;

          const cfgScale = response.request.params.image.parameters.reduce(
            (_, parameters) =>
              parameters.sampler?.cfgScale
                ? Number(parameters.sampler.cfgScale)
                : undefined,
            undefined as number | undefined
          );

          const steps = response.request.params.image.steps
            ? Number(response.request.params.image.steps)
            : undefined;

          const seed = response.request.params.image.seed[0]
            ? Number(response.request.params.image.seed[0])
            : undefined;

          const input: StableStudio.StableDiffusionInput = {
            prompts,

            model,
            style,

            width,
            height,

            cfgScale,
            steps,
            seed,
          };

          const src = response.uri
            ?.replace(
              "https://object.lga1.coreweave.com/stability-staging-assets",
              "https://staging-cdn.stability.ai/assets"
            )
            ?.replace(
              "https://object.lga1.coreweave.com/stability-assets",
              "https://cdn.stability.ai/assets"
            );

          const image = {
            id: imageID,
            createdAt,
            input,
            blob: fetch(src).then((response) => response.blob()),
          };

          return {
            ...previous,
            [id]: {
              ...previous[id],
              ...(exclusiveStartImageID === imageID && {
                exclusiveStartImageID: imageID,
              }),

              images: [...(previous[id]?.images ?? []), image],
              id: id,
            },
          };
        }, {} as ImagesWithBlobPromises);

        return Promise.all(
          Object.values(images).map(async ({ id, images }) => ({
            id,
            images: await Promise.all(
              images?.map(async ({ blob, ...image }) => ({
                ...image,
                blob: await blob,
              }))
            ),
            exclusiveStartImageID: images?.[images.length - 1]?.id,
          }))
        );
      },

      getStableDiffusionModels: async () => {
        const request = await engines.listEngines({});
        const allEngines = await request.response.engine;
        return allEngines.filter((engine) => engine.type === 1 && engine.ready);
      },

      deleteStableDiffusionImages: async (options) => {
        const imageIDs = options?.imageIDs;
        imageIDs &&
          (await project.deleteAssets({ id: "", assetIds: imageIDs }));
      },

      getStatus: () => ({
        indicator: "success",
        text: "Ready",
      }),
    };
  };
  
  return {
    ...functionsWhichNeedAPIKey(
      localStorage.getItem("stability-apiKey") ?? undefined
    ),

    getStableDiffusionSamplers: () => [
      { id: "0", name: "DDIM" },
      { id: "1", name: "DDPM" },
      { id: "2", name: "K Euler" },
      { id: "3", name: "K Euler Ancestral" },
      { id: "4", name: "K Heun" },
      { id: "5", name: "K DPM 2" },
      { id: "6", name: "K DPM 2 Ancestral" },
      { id: "7", name: "K LMS" },
      { id: "8", name: "K DPM++ 2S Ancestral" },
      { id: "9", name: "K DPM++ 2M" },
      { id: "10", name: "K DPM++ SDE" },
    ],

    getStableDiffusionStyles: () => [
      {
        id: "enhance",
        name: "Enhance",
        image: "https://dreamstudio.ai/presets/enhance.png",
      },
      {
        id: "anime",
        name: "Anime",
        image: "https://dreamstudio.ai/presets/anime.png",
      },
      {
        id: "photographic",
        name: "Photographic",
        image: "https://dreamstudio.ai/presets/photographic.png",
      },
      {
        id: "digital-art",
        name: "Digital art",
        image: "https://dreamstudio.ai/presets/digital-art.png",
      },
      {
        id: "comic-book",
        name: "Comic book",
        image: "https://dreamstudio.ai/presets/comic-book.png",
      },
      {
        id: "fantasy-art",
        name: "Fantasy art",
        image: "https://dreamstudio.ai/presets/fantasy-art.png",
      },
      {
        id: "analog-film",
        name: "Analog film",
        image: "https://dreamstudio.ai/presets/analog-film.png",
      },
      {
        id: "neon-punk",
        name: "Neon punk",
        image: "https://dreamstudio.ai/presets/neon-punk.png",
      },
      {
        id: "isometric",
        name: "Isometric",
        image: "https://dreamstudio.ai/presets/isometric.png",
      },
      {
        id: "low-poly",
        name: "Low poly",
        image: "https://dreamstudio.ai/presets/low-poly.png",
      },
      {
        id: "origami",
        name: "Origami",
        image: "https://dreamstudio.ai/presets/origami.png",
      },
      {
        id: "line-art",
        name: "Line art",
        image: "https://dreamstudio.ai/presets/line-art.png",
      },
      {
        id: "modeling-compound",
        name: "Craft clay",
        image: "https://dreamstudio.ai/presets/modeling-compound.png",
      },
      {
        id: "cinematic",
        name: "Cinematic",
        image: "https://dreamstudio.ai/presets/cinematic.png",
      },
      {
        id: "3d-model",
        name: "3D model",
        image: "https://dreamstudio.ai/presets/3d-model.png",
      },
      {
        id: "pixel-art",
        name: "Pixel art",
        image: "https://dreamstudio.ai/presets/pixel-art.png",
      },
    ],

    getStableDiffusionDefaultCount,
    getStableDiffusionDefaultInput: () =>
      getStableDiffusionDefaultInputFromPrompt(
        context.getStableDiffusionRandomPrompt()
      ),

    settings: {
      apiKey: {
        type: "string",

        title: "API key",
        description:
          "You can find your Stability API key at https://dreamstudio.ai/account",

        placeholder: "sk-...",
        required: true,
        password: true,
        value: localStorage.getItem("stability-apiKey") ?? "",
      },
    },

    setSetting: (key, value) => {
      set(({ settings }) => ({
        settings: {
          ...settings,
          [key]: { ...settings[key], value: value as string },
        },
      }));

      if (key === "apiKey" && typeof value === "string") {
        localStorage.setItem("stability-apiKey", value);
        set((plugin) => ({ ...plugin, ...functionsWhichNeedAPIKey(value) }));
      }
    },

    manifest: {
      author: "Stability AI",
      description: markdownDescription,
      name: "Stability AI",
      license: "MIT",
      link: "https://stability.ai",
      version: "0.0.0",
      icon: "https://stability.ai/favicon.ico",
    },
  };
});

function parseExtras(extras: any): any | undefined {
  if (!extras) return undefined;

  if (extras.kind?.oneofKind === "structValue") {
    return parseExtras(extras.kind.structValue.fields);
  } else if (extras.kind?.oneofKind === "listValue") {
    return extras.listValue.values.map(parseExtras);
  } else if (extras.kind?.oneofKind === "numberValue") {
    return Number(extras.kind.numberValue);
  } else if (extras.kind?.oneofKind === "stringValue") {
    return extras.kind.stringValue;
  } else if (extras.kind?.oneofKind === "boolValue") {
    return extras.kind.boolValue;
  } else if (extras.kind?.oneofKind === undefined) {
    return {
      ...Object.keys(extras).reduce((previous, key) => {
        return { ...previous, [key]: parseExtras(extras[key]) };
      }, {}),
    };
  }

  return undefined;
}

const markdownDescription = `
# Welcome to StableStudio!

## [📖 README](https://github.com/Stability-AI/StableStudio) · [🎮 Discord](https://discord.com/channels/1002292111942635562/1108055793674227782) · [🌈 DreamStudio](https://dreamstudio.ai) · [💬 Discussion](https://github.com/Stability-AI/StableStudio/discussions)

# Setup

To get started, you'll need to sign up for a [DreamStudio](https://dreamstudio.ai) account.

Once you're logged in, head to the [account page](https://dreamstudio.ai/account).

You should see a section called \`API keys\`...
![](/media/api_keys_screenshot.png)

If you don't already have a key, you can create one via the plus button...
![](/media/create_api_key_screenshot.png)

You can copy your API key by clicking the copy button...
![](/media/copy_api_key_screenshot.png)

You'll be asked to accept the terms of service.

Now, paste the key into the field below...

The plugin status should change to \`Ready\` once everything is working.
` as const;

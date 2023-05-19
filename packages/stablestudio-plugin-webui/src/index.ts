import * as StableStudio from "@stability/stablestudio-plugin";

function base64ToBlob(base64: string, contentType = '', sliceSize = 512): Promise<Blob> {
    return fetch(`data:${contentType};base64,${base64}`).then(res => res.blob());
}

const getStableDiffusionDefaultCount = () => 4;
export const createPlugin = StableStudio.createPlugin<{
    imagesGeneratedSoFar: number;
    settings: {
        exampleSetting: StableStudio.PluginSettingString;
    };
}>(({set, get}) => {
    const webuiLoad = (): Pick<
        StableStudio.Plugin,
        | "createStableDiffusionImages"
        | "getStatus"
        | "getStableDiffusionModels"
        | "getStableDiffusionSamplers"
    > => {
        return {
            createStableDiffusionImages: async (options) => {
                console.log(options);

                const url = 'http://127.0.0.1:7861/sdapi/v1/txt2img';

                const model = options?.input?.model;

                if (model) {
                    const modelData = {
                        "sd_model_checkpoint": model
                    }

                    const modelUrl = 'http://127.0.0.1:7861/sdapi/v1/options';

                    const modelResponse = await fetch(modelUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(modelData),
                    });

                    console.log(modelResponse);
                }

                const input = {
                    ...options?.input,
                };

                const prompts = input.prompts;

                const prompt = prompts?.at(0)?.text ?? "";
                const negativePrompt = prompts?.at(1)?.text ?? "";
                let seed = options?.input?.seed ?? -1;

                if (seed === 0) {
                    seed = -1;
                }

                const data = {
                    "seed": seed,
                    "sampler_name": options?.input?.sampler?.name ?? "",
                    "sampler_index": options?.input?.sampler?.name ?? "",
                    "prompt": prompt,
                    "negative_prompt": negativePrompt,
                    "steps": options?.input?.steps ?? 20,
                    "batch_size": options?.count ?? getStableDiffusionDefaultCount(),
                    "width": options?.input?.width ?? 512,
                    "height": options?.input?.height ?? 512,
                    "save_images": true,
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const responseData = await response.json();

                const images = [];

                const createdAt = new Date();

                console.log(responseData.images);

                for (let i = 0; i < responseData.images.length; i++) {
                    const blob = await base64ToBlob(responseData.images[i], 'image/jpeg');

                    const image = {
                        id: `${Math.random() * 10000000}`,
                        createdAt,
                        blob
                    }

                    images.push(image)
                }

                set(({imagesGeneratedSoFar}) => ({
                    imagesGeneratedSoFar: imagesGeneratedSoFar + 1,
                }));

                return {
                    id: `${Math.random() * 10000000}`,
                    images: images
                };
            },

            getStableDiffusionModels: async () => {
                const url = 'http://127.0.0.1:7861/sdapi/v1/sd-models';

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const responseData = await response.json();

                const models = [];

                for (let i = 0; i < responseData.length; i++) {
                    const model = {
                        id: responseData[i].title,
                        name: responseData[i].model_name
                    };

                    models.push(model);
                }

                return models;
            },

            getStatus: () => {
                const {imagesGeneratedSoFar} = get();
                return {
                    indicator: "success",
                    text:
                        imagesGeneratedSoFar > 0
                            ? `${imagesGeneratedSoFar} images generated`
                            : "Ready",
                };
            },
        }
    }

    return {
        ...webuiLoad(),

        getStableDiffusionSamplers: async () => {
            const url = 'http://127.0.0.1:7861/sdapi/v1/samplers';

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const responseData = await response.json();

            const samplers = [];

            for (let i = 0; i < responseData.length; i++) {
                const sampler = {
                    id: `${Math.random() * 10000000}`,
                    name: responseData[i].name
                };

                samplers.push(sampler);
            }

            return samplers;
        },

        imagesGeneratedSoFar: 0,

        settings: {
            exampleSetting: {
                type: "string" as const,
                default: "Hello, World!",
                placeholder: "Example setting",
            },
        },

        setSetting: (key, value) =>
            set(({settings}) => ({
                settings: {
                    [key]: {...settings[key], value: value as string},
                },
            })),

        manifest: {
            name: "stable diffusion webui Plugin",
            author: "Terry Jia",
            link: "https://github.com/jtydhr88",
            icon: `${window.location.origin}/DummyImage.png`,
            version: "0.0.1",
            license: "MIT",
            description: "An plugin for Stable Diffusion webui",
        },
    }
});

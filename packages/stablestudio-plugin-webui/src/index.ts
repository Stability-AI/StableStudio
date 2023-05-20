import * as StableStudio from "@stability/stablestudio-plugin";

function base64ToBlob(base64: string, contentType = '', sliceSize = 512): Promise<Blob> {
    return fetch(`data:${contentType};base64,${base64}`).then(res => res.blob());
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;

        reader.readAsDataURL(blob);
    });
}

const getStableDiffusionDefaultCount = () => 4;
export const createPlugin = StableStudio.createPlugin<{
    imagesGeneratedSoFar: number;
    settings: {
        webuiHostUrl: StableStudio.PluginSettingString;
    };
}>(({set, get}) => {
    const webuiLoad = (webuiHostUrl?: string): Pick<
        StableStudio.Plugin,
        | "createStableDiffusionImages"
        | "getStatus"
        | "getStableDiffusionModels"
        | "getStableDiffusionSamplers"
    > => {
        if (webuiHostUrl === "") {
            webuiHostUrl = "http://127.0.0.1:7861";
        }

        return {
            createStableDiffusionImages: async (options) => {
                console.log(options);

                let url = webuiHostUrl + '/sdapi/v1/txt2img';

                if (options?.input?.initialImage) {
                    url = webuiHostUrl + '/sdapi/v1/img2img';
                }

                const model = options?.input?.model;

                if (model) {
                    const modelData = {
                        "sd_model_checkpoint": model
                    }

                    const modelUrl = webuiHostUrl + '/sdapi/v1/options';

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

                interface dataObject {
                    [key: string]: any;
                }

                let data: dataObject = {};

                data["seed"] = seed;
                data["sampler_name"] = options?.input?.sampler?.name ?? "";
                data["sampler_index"] = options?.input?.sampler?.name ?? "";
                data["prompt"] = prompt;
                data["negative_prompt"] = negativePrompt;
                data["steps"] = options?.input?.steps ?? 20;
                data["batch_size"] = options?.count ?? getStableDiffusionDefaultCount();
                data["width"] = options?.input?.width ?? 512;
                data["height"] = options?.input?.height ?? 512;
                data["save_images"] = true;

                if (options?.input?.initialImage?.weight && options?.input?.initialImage?.blob) {
                    data["denoising_strength"] = 1 - options.input.initialImage.weight;

                    const initImgB64 = await blobToBase64(options?.input?.initialImage?.blob);

                    data["init_images"] = [initImgB64.split(",")[1]];
                }

                console.log(data);

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
                const url = webuiHostUrl + '/sdapi/v1/sd-models';

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

    let webuiHostUrl = localStorage.getItem("webui-host-url");

    if (webuiHostUrl === "" || !webuiHostUrl) {
        webuiHostUrl = "http://127.0.0.1:7861";
    }

    return {
        ...webuiLoad(webuiHostUrl),

        getStableDiffusionSamplers: async () => {
            const url = webuiHostUrl + '/sdapi/v1/samplers';

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
            webuiHostUrl: {
                type: "string",
                title: "Webui Host URL",
                description:
                    "put your webui url here, the default value is http://127.0.0.1:7861",
                placeholder: "http://127.0.0.1:7861",
                value: localStorage.getItem("webui-host-url") ?? "",
            },
        },

        setSetting: (key, value) => {
            set(({settings}) => ({
                settings: {
                    ...settings,
                    [key]: {...settings[key], value: value as string},
                },
            }));

            if (key === "webuiHostUrl" && typeof value === "string") {
                localStorage.setItem("webui-host-url", value);
                set((plugin) => ({...plugin, ...webuiLoad(value)}));
            }
        },

        manifest: {
            name: "Stable Diffusion webui Plugin",
            author: "Terry Jia",
            link: "https://github.com/jtydhr88",
            icon: `${window.location.origin}/DummyImage.png`,
            version: "0.0.1",
            license: "MIT",
            description: "An plugin for Stable Diffusion webui",
        },
    }
});

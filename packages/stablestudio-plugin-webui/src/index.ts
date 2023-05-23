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

const webuiUpscalers = [
    {
        label: "None",
        value: "None"
    },
    {
        label: "Lanczos",
        value: "Lanczos"
    },
    {
        label: "Nearest",
        value: "Nearest"
    },
    {
        label: "ESRGAN_4x",
        value: "ESRGAN_4x"
    },
    {
        label: "LDSR",
        value: "LDSR"
    },
    {
        label: "R-ESRGAN 4x+",
        value: "R-ESRGAN 4x+"
    },
    {
        label: "R-ESRGAN 4x+ Anime6B",
        value: "R-ESRGAN 4x+ Anime6B"
    },
    {
        label: "ScuNET GAN",
        value: "ScuNET GAN"
    },
    {
        label: "ScuNET PSNR",
        value: "ScuNET PSNR"
    },
    {
        label: "SwinIR_4x",
        value: "SwinIR_4x"
    }
];

const getNumber = (strValue: string | null, defaultValue: number) => {
    let retValue = defaultValue;

    if (strValue) {
        retValue = Number(strValue);
    }

    return retValue;
}

const getStableDiffusionDefaultCount = () => 4;
export const createPlugin = StableStudio.createPlugin<{
    imagesGeneratedSoFar: number;
    settings: {
        webuiHostUrl: StableStudio.PluginSettingString;
        historyImagesCount: StableStudio.PluginSettingNumber;
        upscaler1: StableStudio.PluginSettingString;
    };
}>(({set, get}) => {
    const webuiLoad = (webuiHostUrl?: string): Pick<
        StableStudio.Plugin,
        | "createStableDiffusionImages"
        | "getStatus"
        | "getStableDiffusionModels"
        | "getStableDiffusionSamplers"
        | "getStableDiffusionDefaultCount"
        | "getStableDiffusionDefaultInput"
        | "getStableDiffusionExistingImages"
    > => {
        if (webuiHostUrl === "") {
            webuiHostUrl = "http://127.0.0.1:7861";
        }

        return {
            createStableDiffusionImages: async (options) => {
                console.log(options);

                const optionsUrl = webuiHostUrl + '/sdapi/v1/options';

                const optionsResponse = await fetch(optionsUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const webUIOptions = await optionsResponse.json();

                const model = options?.input?.model;

                let url = webuiHostUrl + '/sdapi/v1/txt2img';

                let isUpscale = false;

                if (options?.input?.initialImage) {
                    url = webuiHostUrl + '/sdapi/v1/img2img';

                    // use this condition to assume the user wants to upscale
                    if ((options?.input?.initialImage?.weight === 1) && (model === "esrgan-v1-x2plus")) {
                        isUpscale = true;

                        url = webuiHostUrl + '/sdapi/v1/extra-single-image';
                    }
                }

                if (model && model !== webUIOptions["sd_model_checkpoint"] && !isUpscale) {
                    console.log("applying model");

                    localStorage.setItem("model", model)

                    const modelData = {
                        "sd_model_checkpoint": model
                    }

                    const modelResponse = await fetch(optionsUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(modelData),
                    });

                    if (modelResponse.ok) {
                        console.log("applied model");
                    }
                }

                const sampler = options?.input?.sampler?.name;

                if (sampler) {
                    localStorage.setItem("sampler", sampler)
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


                if (!isUpscale) {
                    data["seed"] = seed;
                    data["sampler_name"] = options?.input?.sampler?.name ?? "";
                    data["sampler_index"] = options?.input?.sampler?.name ?? "";
                    data["prompt"] = prompt;
                    data["negative_prompt"] = negativePrompt;
                    data["steps"] = options?.input?.steps ?? 20;
                    data["batch_size"] = options?.count ?? getStableDiffusionDefaultCount();

                    data["width"] = options?.input?.width ?? 512;

                    localStorage.setItem("width", data["width"]);

                    data["height"] = options?.input?.height ?? 512;

                    localStorage.setItem("height", data["height"]);

                    data["save_images"] = true;
                } else {
                    data["upscaling_resize_w"] = options?.input?.width ?? 512;

                    data["upscaling_resize_h"] = options?.input?.height ?? 512;

                    data["upscaler_1"] = get().settings.upscaler1.value;
                }

                if (options?.input?.initialImage?.weight && !isUpscale) {
                    data["denoising_strength"] = 1 - options.input.initialImage.weight;
                }

                if (options?.input?.cfgScale) {
                    data["cfg_scale"] = options?.input?.cfgScale;

                    localStorage.setItem("cfgScale", data["cfg_scale"])
                }

                if (options?.input?.initialImage?.blob) {
                    const initImgB64 = await blobToBase64(options?.input?.initialImage?.blob);

                    if (isUpscale) {
                        data["image"] = initImgB64.split(",")[1];
                    } else {
                        data["init_images"] = [initImgB64.split(",")[1]];
                    }
                }

                if (options?.input?.maskImage?.blob) {
                    const maskImgB64 = await blobToBase64(options?.input?.maskImage?.blob);

                    data["mask"] = maskImgB64.split(",")[1];

                    data["inpainting_mask_invert"] = 1 // Mask mode
                    data["inpainting_fill"] = 1 // Masked content
                    data["inpaint_full_res"] = false // Inpaint area
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

                console.log(responseData)

                const images = [];
                const createdAt = new Date();

                if (isUpscale) {
                    const blob = await base64ToBlob(responseData.image, 'image/jpeg');

                    const image = {
                        id: `${Math.random() * 10000000}`,
                        createdAt: createdAt,
                        blob: blob,
                        input: {
                            model: localStorage.getItem("model")
                        }
                    }

                    images.push(image);
                } else {
                    const generatedImagesLength = responseData.images.length;

                    let startIndex = 0;

                    if (generatedImagesLength > data["batch_size"]) {
                        startIndex = 1;
                    }

                    for (let i = startIndex; i < responseData.images.length; i++) {
                        const blob = await base64ToBlob(responseData.images[i], 'image/jpeg');

                        const image = {
                            id: `${Math.random() * 10000000}`,
                            createdAt,
                            blob
                        }

                        images.push(image)
                    }

                    set(({imagesGeneratedSoFar}) => ({
                        imagesGeneratedSoFar: imagesGeneratedSoFar + data["batch_size"],
                    }));
                }

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

            getStatus: async () => {
                const optionsUrl = webuiHostUrl + '/sdapi/v1/options';

                const optionsResponse = await fetch(optionsUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                return optionsResponse.ok ? {
                    indicator: "success",
                    text: "Ready",
                } : {
                    indicator: "error",
                    text: "unable to connect webui on " + webuiHostUrl
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

        getStableDiffusionDefaultCount: () => 4,

        getStableDiffusionDefaultInput: () => {
            return {
                steps: 20,
                sampler: {
                    id: localStorage.getItem("sampler") ?? "",
                    name: localStorage.getItem("sampler") ?? ""
                },
                model: localStorage.getItem("model") ?? ""
            }
        },

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
                    id: responseData[i].name,
                    name: responseData[i].name
                };

                samplers.push(sampler);
            }

            return samplers;
        },

        getStableDiffusionExistingImages: async () => {
            const existingImagesUrl = webuiHostUrl + '/StableStudio/get-generated-images';

            const data = {
                limit: get().settings.historyImagesCount.value
            }

            const existingImagesResponse = await fetch(existingImagesUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!existingImagesResponse.ok) {
                console.warn("unable to get existing data from webui");
            }

            const responseData = await existingImagesResponse.json();

            const images = [];

            for (let i = 0; i < responseData.length; i++) {
                const blob = await base64ToBlob(responseData[i].content, 'image/jpeg');

                let timestampInSeconds = responseData[i].create_date;
                let timestampInMilliseconds = timestampInSeconds * 1000;
                let createdAt = new Date(timestampInMilliseconds);

                const stableDiffusionImage = {
                    id: responseData[i].image_name,
                    createdAt: createdAt,
                    blob: blob,
                    input: {
                        prompts: [],
                        style: "",
                        steps: -1,
                        seed: responseData[i].seed,
                        model: "",
                        width: responseData[i].width,
                        height: responseData[i].height
                    }
                }

                images.push(stableDiffusionImage)
            }

            const stableDiffusionImages = {
                id: `${Math.random() * 10000000}`,
                images: images
            }

            console.log(responseData);

            return [stableDiffusionImages]
        },

        imagesGeneratedSoFar: 0,

        settings: {
            webuiHostUrl: {
                type: "string",
                title: "Webui Host URL",
                description:
                    "put your webui api url here, the default value is http://127.0.0.1:7861",
                placeholder: "http://127.0.0.1:7861",
                value: localStorage.getItem("webui-host-url") ?? "",
            },
            historyImagesCount: {
                type: "number",
                title: "History image count",
                description:
                    "How many images do you get from webui locally?",
                min: 0,
                max: 50,
                step: 1,
                variant: "slider",
                value: getNumber(localStorage.getItem("historyImagesCount"), 20),
            },
            upscaler1: {
                type: "string",
                title: "Upscaler 1",
                options: webuiUpscalers,
                value: localStorage.getItem("upscaler1") ?? "None",
            }
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
            } else if (key === "upscaler1" && typeof value === "string") {
                localStorage.setItem("upscaler1", value);
            } else if (key === "historyImagesCount" && typeof value === "number") {
                localStorage.setItem("historyImagesCount", value.toString());
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

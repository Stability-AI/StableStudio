import { StableDiffusionInput } from "@stability/stablestudio-plugin";

import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";

import { Image } from "./Image";
import { Inputs } from "./Inputs";

export * from "./Inputs";

export type Input = Generation.Image.Model.StableDiffusionV1.Input;

export declare namespace Input {
  export { Image };
}

export namespace Input {
  Input.Image = Image;

  export const upscaleEngines = [
    "esrgan-v1-x2plus",
    "stable-diffusion-x2-latent-upscaler",
    "stable-diffusion-x4-latent-upscaler",
  ] as const;

  export type Sampler = StableDiffusionInput["sampler"];

  export type Modifiers = Partial<Input & { count: number }>;

  export const initial = (id: ID) =>
    Generation.Image.Model.StableDiffusionV1.Input.initial(id);

  export const promptText = (input: Input) =>
    input.prompts.map((prompt) => prompt.text).join(" ");

  export const isUpscaling = (input: Input) =>
    upscaleEngines.includes(input.model as any);

  export const get = (id: ID): Input | undefined => Inputs.get()[id];
  export const set = (
    id: ID,
    setInput: (input: Mutable<Input>) => Input | void
  ) =>
    Inputs.set((inputs) => ({
      ...inputs,
      [id]: copy(inputs[id] ?? initial(id), setInput),
    }));

  export function use(id?: ID) {
    const input = Inputs.State.use(({ inputs }) => {
      if (!id) return;

      const input = inputs[id] ?? initial(id);
      if (!inputs[id]) Inputs.set((inputs) => ({ ...inputs, [id]: input }));

      return input;
    }, GlobalState.shallow);

    const setInput = useCallback(
      (setInput: (input: Mutable<Input>) => Input | void) =>
        Inputs.set((inputs) =>
          id !== undefined && input !== undefined
            ? { ...inputs, [id]: copy(input, setInput) }
            : inputs
        ),
      [id, input]
    );

    const shuffle = useCallback(
      (index = 0) =>
        setInput((input) => {
          const previous = input.prompts[index];
          if (!previous) return;

          input.prompts[index] = {
            ...previous,
            text: Generation.Image.Prompt.Random.get(),
          };
        }),
      [setInput]
    );

    const addPrompt = useCallback(
      () =>
        setInput((input) => {
          input.prompts.push({ weight: 1 });
        }),
      [setInput]
    );

    const swapPrompts = useCallback(
      (indexA: number, indexB: number) =>
        setInput((input) => {
          const promptA = input.prompts[indexA];
          const promptB = input.prompts[indexB];
          if (promptA === undefined || promptB === undefined) return;

          input.prompts[indexA] = promptB;
          input.prompts[indexB] = promptA;
        }),
      [setInput]
    );

    const deletePrompt = useCallback(
      (index = 0) =>
        setInput((input) => {
          input.prompts.splice(index, 1);
        }),
      [setInput]
    );

    const importInit = useCallback(() => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        const objectURL = URL.createObjectURL(file);

        setInput((input) => {
          input.init = {
            src: objectURL,
            mask: false,
            weight: 1,
          };
        });
      };
      input.click();
    }, [setInput]);

    return useMemo(
      () => ({
        input,
        setInput,
        shuffle,
        addPrompt,
        swapPrompts,
        deletePrompt,
        importInit,
      }),
      [
        input,
        setInput,
        shuffle,
        addPrompt,
        swapPrompts,
        deletePrompt,
        importInit,
      ]
    );
  }

  export const resizeInit = async (
    input: Input
  ): Promise<string | undefined> => {
    if (!input.init) return;

    let data = "";
    const isUpscaling = Generation.Image.Input.isUpscaling(input);

    if ("base64" in input.init) {
      data = input.init.base64;
    } else if (input.init.src.startsWith("blob:")) {
      data = input.init.src;
    } else {
      const response = await fetch(input.init.src);
      data = URL.createObjectURL(await response.blob());
    }

    const image = new window.Image();
    image.src = data;

    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    canvas.width = !isUpscaling
      ? Math.ceil(input.width / 64) * 64
      : image.width;
    canvas.height = !isUpscaling
      ? Math.ceil(input.height / 64) * 64
      : image.height;

    const context = canvas.getContext("2d");
    if (!context) return;

    // draw grey background
    context.fillStyle = "#333";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (isUpscaling) {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      console.log({
        width: canvas.width,
        height: canvas.height,
      });
      return canvas.toDataURL("image/png");
    }

    const scaleFactor = Math.max(
      input.width / image.width,
      input.height / image.height
    );
    const scaledWidth = image.width * scaleFactor;
    const scaledHeight = image.height * scaleFactor;
    const x = (input.width - scaledWidth) / 2;
    const y = (input.height - scaledHeight) / 2;

    context.drawImage(image, x, y, scaledWidth, scaledHeight);
    return canvas.toDataURL("image/png");
  };

  export async function toInput(input: Input): Promise<StableDiffusionInput> {
    const pluginInput: StableDiffusionInput = {
      sampler: input.sampler,
      cfgScale: input.cfgScale,
      height: input.height,
      width: input.width,
      model: input.model,
      seed: input.seed,
      steps: input.steps,
      style: input.extras?.$IPC?.preset,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pluginInput.prompts = isUpscaling(input)
      ? []
      : (input.prompts.filter(
          (i) => i.text && i.weight
        ) as StableDiffusionInput["prompts"]);

    if (input.mask) {
      pluginInput.maskImage = {
        blob: await convertToBlob(
          "base64" in input.mask ? input.mask.base64 : input.mask.src
        ),
        weight: 1,
      };
    }

    if (input.init) {
      pluginInput.initialImage = {
        blob: await convertToBlob(
          "base64" in input.init ? input.init.base64 : input.init.src
        ),
        weight: input.strength,
      };
    }

    if (!isUpscaling(input)) {
      pluginInput.height = input.height;
    }

    return pluginInput;
  }

  async function convertToBlob(dataURI: string): Promise<Blob> {
    if (dataURI.startsWith("http") || dataURI.startsWith("blob")) {
      const response = await fetch(dataURI);
      return response.blob();
    } else {
      const raw = window.Buffer.from(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        dataURI.split(";base64,").pop()!,
        "base64"
      );
      return new Blob([raw]);
    }
  }
}

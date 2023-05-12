import { Generation } from "~/Generation";

import { Modal } from "./Modal";

export declare namespace Download {
  export { Modal };
}

export namespace Download {
  Download.Modal = Modal;

  export const fileName = (input: Generation.Image.Input) => {
    const promptText = input.prompts.map(({ text }) => text).join(" ");
    const promptTrimmed = (promptText ?? "").slice(0, 50);

    const model = input.model
      .replace("stable-diffusion-", "")
      .replace("stable-", "");

    const seed = input.seed;
    return `${seed}_${promptTrimmed}_${model}.png`;
  };

  export const execute = async (
    image: Generation.Image,
    input: Generation.Image.Input,
    name?: string
  ) => {
    const href = await Generation.Image.blobURL(image);
    if (!href) return;

    const a = document.createElement("a");
    a.href = href;
    a.download = name ?? fileName(input);
    a.click();
  };

  export const use = (image?: Generation.Image) => {
    const { image: modalImage, fileName, setImage } = Modal.State.use();

    return useCallback(
      async (overrideImage?: Generation.Image) => {
        if (overrideImage) {
          const input = Generation.Image.Input.get(overrideImage.inputID);
          if (input) return execute(overrideImage, input);
        }

        if (!image) return;

        const input = Generation.Image.Input.get(image.inputID);
        if (!input) return;

        if (image === modalImage) {
          await execute(image, input, fileName);
        } else {
          setImage(image);
        }
      },
      [fileName, image, modalImage, setImage]
    );
  };
}

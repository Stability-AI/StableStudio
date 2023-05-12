import { Generation } from "~/Generation";

import { Zip } from "./Zip";

export declare namespace Download {
  export { Zip };
}

export namespace Download {
  Download.Zip = Zip;

  export const execute = async (images: Generation.Images) =>
    images.forEach((image) => {
      const input = Generation.Image.Input.get(image.inputID);
      input && Generation.Image.Download.execute(image, input);
    });

  export const use = (images: Generation.Images) =>
    useCallback(() => execute(images), [images]);
}

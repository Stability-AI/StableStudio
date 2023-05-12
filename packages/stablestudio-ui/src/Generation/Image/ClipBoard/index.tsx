import { Generation } from "~/Generation";

export namespace ClipBoard {
  export const useCopy = () =>
    useCallback(async (image: Generation.Image) => {
      const blob = await Generation.Image.blob(image);
      if (!blob) return;

      const clipboard = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([clipboard]);
    }, []);
}

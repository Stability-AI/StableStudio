import * as FileSaver from "file-saver";
import jszip from "jszip";

import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export namespace Zip {
  export function Button({
    images = [],
    ...props
  }: Theme.Button.Props & { images: Generation.Images }) {
    const [realLoading, setRealLoading] = useState(false);
    const downloadZip = use();

    if (!images[0]) return null;
    return (
      <Theme.Button
        {...props}
        icon={Theme.Icon.Download}
        loading={realLoading}
        onClick={() => {
          setRealLoading(true);
          downloadZip(images, () => setRealLoading(false));
        }}
      >
        Download
        <span className="opacity-muted">({images.length})</span>
      </Theme.Button>
    );
  }

  export const use = () => {
    const [inputs] = Generation.Image.Inputs.use();
    return useCallback(
      async (images: Generation.Images, onFinish?: () => void) => {
        if (!images[0]) return;

        const zip = new jszip();

        let index = 0;
        for (const image of images) {
          const src = image?.src;
          if (!src) return;

          const response = await fetch(src);
          const blob = await response.blob();

          const input = inputs[image.inputID];
          if (!input) continue;

          const fileName = Generation.Image.Download.fileName(input).replace(
            ".png",
            `_${index}.png`
          );

          zip.file(fileName, blob, { binary: true });
          index++;
        }

        const currentDateTime = new Date().toISOString().slice(0, 10);
        const zip_filename = `DreamStudio_${currentDateTime}.zip`;
        const content = await zip.generateAsync({ type: "blob" });

        FileSaver.saveAs(content, zip_filename);

        onFinish?.();
      },
      []
    );
  };
}

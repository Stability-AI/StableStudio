import { Editor } from "~/Editor";

export namespace Import {
  export const useOnDrop = () => {
    const canvas = Editor.Canvas.use();
    const createImageFromURL = Editor.Image.Create.useFromURL();

    return useCallback(
      async (event: React.DragEvent<HTMLDivElement>) => {
        if (!canvas.current) return;

        event.preventDefault();
        canvas.current.setPointersPositions(event);

        const mousePosition = canvas.current.getPointerPosition();
        if (!mousePosition) return;

        const scale = canvas.current.scaleX();
        const position = canvas.current.position();
        const x = (mousePosition.x - position.x) / scale;
        const y = (mousePosition.y - position.y) / scale;

        for (const file of event.dataTransfer.files) {
          const url = URL.createObjectURL(file);
          createImageFromURL(url, {
            x,
            y,
            title: file.name ?? "Imported Image",
          });
        }
      },
      [canvas, createImageFromURL]
    );
  };

  export const useOpenFiles = () => {
    const getCameraCenter = Editor.Camera.Center.useGet();
    const createImageFromURL = Editor.Image.Create.useFromURL();

    return useCallback(() => {
      const center = getCameraCenter();
      if (!center) return;

      const x = center.x;
      const y = center.y;

      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = "image/*";
      input.style.display = "none";
      document.body.appendChild(input);
      input.click();

      input.onchange = () => {
        for (const file of input.files ?? []) {
          const url = URL.createObjectURL(file);

          const element = new Image();
          element.src = url;
          element.onload = () => {
            const offset = {
              x: element.width / 2,
              y: element.height / 2,
            };

            createImageFromURL(url, {
              x: x - offset.x,
              y: y - offset.y,
              title: file.name ?? "Imported Image",
            });
          };
        }
      };
    }, [createImageFromURL, getCameraCenter]);
  };
}

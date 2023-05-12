import { Editor } from "~/Editor";
import { Generation } from "~/Generation";
import { Router } from "~/Router";

export namespace Import {
  export const use = (image?: Generation.Image) => {
    const navigate = Router.useNavigate();
    const createDream = Editor.Dream.Create.use();
    const createImage = Editor.Image.Create.useFromURL();
    return useCallback(async () => {
      if (!image?.src) return;

      const editorImage = await createImage(image.src, {
        ...image,
        title: Generation.Image.Input.get(image.inputID)?.prompts[0].text,
      });

      createDream({
        inputID: image.inputID,
        dream: {
          x: editorImage.x,
          y: editorImage.y,
          width: editorImage.width,
          height: editorImage.height,
        },
      });

      navigate("/edit");
    }, [image, createImage, createDream, navigate]);
  };
}

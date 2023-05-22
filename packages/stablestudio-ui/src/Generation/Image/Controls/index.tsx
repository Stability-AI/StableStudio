import { Editor } from "~/Editor";
import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

import { Button, Buttons } from "./Button";

export function Controls({ image }: { image: Generation.Image }) {
  const download = Generation.Image.Download.use(image);
  const setInitialImage = Generation.Image.Session.useSetInitialImage();
  const createVariations = Generation.Image.Session.useCreateVariations(image);
  const sendToEditor = Editor.Import.use(image);

  const { input } = Generation.Image.Input.use(image.inputID);
  const isInitialImage = useMemo(
    () => !!input?.init && "src" in input.init && input.init?.src === image.src,
    [input, image.src]
  );

  const createVariationsButton = useMemo(
    () =>
      input?.id &&
      !Generation.Image.Input.isUpscaling(input) && (
        <Button
          button={(props) => (
            <Generation.Image.Variations.Create.Button
              {...props}
              id={input.id}
              icon={Theme.Icon.Variation}
              onIdleClick={createVariations}
              color="white"
              noBrand
            />
          )}
          transparent
          className="-ml-1 mr-auto"
        />
      ),
    [input, createVariations]
  );

  const editorButton = useMemo(
    () => (
      <Button
        icon={Theme.Icon.Edit}
        name="Edit image"
        onClick={sendToEditor}
        color="white"
        transparent
      />
    ),
    [sendToEditor]
  );

  const initialImageButton = useMemo(
    () => (
      <Button
        icon={Theme.Icon.Image}
        name={isInitialImage ? "Initial image" : "Set as initial image"}
        disabled={isInitialImage}
        className={classes(isInitialImage && "opacity-50")}
        onClick={() => setInitialImage(image)}
        color="white"
        transparent
      />
    ),
    [isInitialImage, setInitialImage, image]
  );

  const isMobileDevice = Theme.useIsMobileDevice();

  return useMemo(
    () => (
      <>
        <div className="pointer-events-none absolute flex h-full w-full flex-col justify-between opacity-0 duration-150 group-hover:opacity-75">
          <div className="h-[6rem] bg-gradient-to-b from-black to-transparent" />
          <div className="h-[6rem] bg-gradient-to-b from-transparent to-black sm:hidden" />
        </div>
        <div className="pointer-events-none absolute flex h-full w-full flex-col justify-between opacity-0 duration-150 group-hover:opacity-100">
          <Generation.Image.Controls.Buttons y={-6}>
            {createVariationsButton}
            {!isMobileDevice && (
              <>
                {editorButton}
                {initialImageButton}
                <Generation.Image.Controls.Button
                  name="Download image"
                  icon={Theme.Icon.Download}
                  color="white"
                  onClick={() => download()}
                  transparent
                />
                <Generation.Images.Delete.Button images={[image.id]} />
              </>
            )}
          </Generation.Image.Controls.Buttons>
          {isMobileDevice && (
            <Generation.Image.Controls.Buttons className="justify-start" y={6}>
              {initialImageButton}
              <Generation.Image.Controls.Button
                name="Download image"
                icon={Theme.Icon.Download}
                onClick={() => download()}
                transparent
              />
              <Generation.Images.Delete.Button images={[image.id]} />
            </Generation.Image.Controls.Buttons>
          )}
        </div>
      </>
    ),
    [
      createVariationsButton,
      isMobileDevice,
      editorButton,
      initialImageButton,
      download,
      image.id,
    ]
  );
}

Controls.Button = Button;
Controls.Buttons = Buttons;

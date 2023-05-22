import { App } from "~/App";
import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export namespace Sidebar {
  export function Section({ id }: { id: ID }) {
    const { setInput, importInit, input } = Generation.Image.Input.use(id);
    const [imageHovering, setImageHovering] = useState(false);
    const draggingImage = Generation.Image.HTMLElement.Dragging.useImage();

    const setLastStrength = Generation.Image.Session.useSetLastStrength();
    const setInitialImage = Generation.Image.Session.useSetInitialImage();

    const defaultExpanded = useMemo(
      () => !!input?.init || !!draggingImage,
      [input?.init, draggingImage]
    );

    const aspectRatio = useMemo(
      () => (input?.width && input?.height ? input.width / input.height : 1),
      [input]
    );

    const uploadProps = useMemo(
      () => ({
        onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setImageHovering(true);
        },

        onDragLeave: (event: React.DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setImageHovering(false);
        },

        onDrop: (event: React.DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setImageHovering(false);

          const file = event.dataTransfer?.files[0];
          const objectURL = file && URL.createObjectURL(file);

          setInitialImage(objectURL ?? draggingImage);
        },
      }),
      [setInitialImage, draggingImage]
    );

    if (!input) return null;
    return (
      <App.Sidebar.Section
        divider
        collapsable
        padding="sm"
        title={input.init ? "Image" : "Upload image"}
        defaultExpanded={defaultExpanded}
        button={(props) =>
          input.init ? (
            <Theme.Button
              {...props}
              icon={Theme.Icon.Trash}
              onClick={() => {
                setInput((input) => {
                  input.init = null;
                });
              }}
            />
          ) : (
            <Theme.Button
              {...props}
              icon={Theme.Icon.Upload}
              onClick={importInit}
            />
          )
        }
      >
        <div className="flex flex-col">
          <div className="flex flex-col overflow-hidden rounded border border-black/20 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800">
            {input.init && !imageHovering ? (
              <>
                <div
                  onClick={importInit}
                  {...uploadProps}
                  className="hover:opacity-muted group relative flex aspect-square max-h-[140px] cursor-pointer items-center justify-center overflow-hidden rounded bg-black/20"
                >
                  <div
                    className="relative h-full max-h-[140px] overflow-hidden"
                    style={{
                      aspectRatio,
                      background: "hsl(0, 0%, 50%)",
                      ...({
                        "--blur": `${
                          Math.pow(1 - input.strength, 8) * 50 +
                          (1 - input.strength) * 3
                        }px`,
                      } as React.CSSProperties),
                    }}
                    css={css`
                      &::after {
                        content: "";
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        backdrop-filter: blur(var(--blur));
                      }
                    `}
                  >
                    <img
                      src={
                        "base64" in input.init
                          ? input.init.base64
                          : input.init.src
                      }
                      id="init-img"
                      className="absolute h-full w-full object-cover"
                      style={{ aspectRatio }}
                    />
                  </div>
                  <Theme.Icon.Upload
                    className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 transform text-white mix-blend-overlay group-hover:block"
                    size={24}
                  />
                </div>
                <div className="mt-2">
                  <Theme.Slider
                    value={input.strength * 100}
                    min={0}
                    max={100}
                    step={1}
                    percentage
                    title="Image strength"
                    onChange={(weight) => {
                      const strength = weight / 100;

                      setLastStrength(strength);
                      setInput((input) => {
                        input.strength = weight / 100;
                      });
                    }}
                  />
                </div>
              </>
            ) : (
              <div
                className={classes(
                  "group flex cursor-pointer flex-col items-center justify-center gap-4 rounded bg-white px-3 py-4 text-center dark:bg-zinc-800"
                )}
                {...uploadProps}
                onClick={importInit}
              >
                {imageHovering ? (
                  <>
                    <Theme.Icon.Upload
                      size={28}
                      className="pointer-events-none"
                    />
                    <h3 className="pointer-events-none">
                      Drop image here to create variations
                    </h3>
                  </>
                ) : (
                  <>
                    <Theme.Icon.Upload
                      size={28}
                      className="opacity-75 duration-100 group-hover:opacity-100"
                    />
                    <h3 className="opacity-75 duration-100 group-hover:opacity-100">
                      Upload an image to create variations
                    </h3>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </App.Sidebar.Section>
    );
  }
}

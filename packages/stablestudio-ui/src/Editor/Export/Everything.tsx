import { AnimatePresence, motion } from "framer-motion";
import { Editor } from "~/Editor";
import { Boxes } from "~/Geometry";
import { Shortcut as Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export namespace Everything {
  export function Tool() {
    const { setOrigin, setSize } = Editor.Canvas.ExportBox.useState(
      (state) => ({
        setOrigin: state.setOrigin,
        setSize: state.setSize,
      })
    );

    const [nothingInView, setNothingInView] = useState(false);

    const entities = Editor.Entities.use();
    const stageRef = Editor.Canvas.use();

    function getFilteredEntities(): Editor.Images | undefined {
      if (!stageRef || !stageRef.current) return undefined;

      const scale = stageRef.current.scaleX() || 1;
      const position = stageRef.current.getPosition() || { x: 0, y: 0 };

      // filter entities in the stageRef visibility (entity x/y/width/height inside of stageRef x/y/width/height)
      return entities
        .filter(
          (entity) =>
            entity.type === "image" &&
            entity.visible &&
            entity.x * scale + position.x >= 0 &&
            entity.y * scale + position.y >= 0 &&
            entity.x * scale + entity.width * scale + position.x <=
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              stageRef.current!.width() &&
            entity.y * scale + entity.height * scale + position.y <=
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              stageRef.current!.height()
        )
        .reverse() as Editor.Image[];
    }

    return (
      <>
        <Editor.Tool
          label="Smart export"
          onMouseEnter={() => {
            if (stageRef && stageRef.current) {
              const filtered = getFilteredEntities();
              if (filtered && filtered.length > 0) {
                const bounds = Boxes.surroundingBox(filtered);
                if (bounds) {
                  setOrigin(() => [bounds.x, bounds.y]);
                  setSize(() => [bounds.width, bounds.height]);
                }
              } else {
                setNothingInView(true);
              }
            }
          }}
          onMouseLeave={() => {
            setOrigin(() => null);
            setSize(() => [0, 0]);
            setNothingInView(false);
          }}
          onClick={() => {
            const filtered = getFilteredEntities();
            if (filtered) {
              const bounds = Boxes.surroundingBox(filtered);
              if (bounds) {
                const canvas = Editor.Canvas.Render.createImageFromBox(
                  bounds.x,
                  bounds.y,
                  bounds.width,
                  bounds.height,
                  filtered,
                  1
                );

                if (canvas) {
                  const link = document.createElement("a");
                  link.download = "export.png";
                  link.href = canvas.toDataURL("image/png");
                  link.click();
                  canvas.remove();
                }
              }
            }

            setOrigin(() => null);
            setSize(() => [0, 0]);
          }}
        >
          <Theme.Icon.Download strokeWidth={1.5} size={22} />
        </Editor.Tool>

        <AnimatePresence>
          {nothingInView && (
            <motion.div
              className="pointer-events-none absolute inset-0 flex h-screen w-screen select-none items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.05 }}
            >
              <div className="rounded border border-zinc-300 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
                <h1 className="opacity-muted text-lg font-light">
                  No images in view
                </h1>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  export namespace Shortcuts {
    export const use = () => {
      Shortcut.use(
        useMemo(
          () => ({
            name: ["Export", "Everything"],
            icon: Theme.Icon.Download,

            keys: ["Meta", "e"],
            action: () =>
              alert("TODO: We need to refactor `Editor.Export.Everything`"),
          }),
          []
        )
      );
    };
  }
}

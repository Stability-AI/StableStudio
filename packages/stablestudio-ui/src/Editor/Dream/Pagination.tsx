import { AnimatePresence, motion } from "framer-motion";
import { Editor } from "~/Editor";
import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export function Pagination({ id }: { id: ID }) {
  const [dream, setDream] = Editor.Entity.use<Editor.Dream>(id);
  const selected = Editor.Selection.useSelected(id);
  const onChoose = Editor.Dream.Choose.use(id);
  const output = Generation.Image.Output.use(dream?.outputID);

  const choiceCount = output?.imageIDs.length ?? 0;
  const pages =
    choiceCount > Editor.Dream.Results.pageSize() - 1
      ? Math.ceil(choiceCount / Editor.Dream.Results.pageSize())
      : choiceCount;

  const pageCount = dream?.lastMode !== "txt2img" ? choiceCount : pages;
  const page = dream?.choicesPage ?? 0;

  const onPaginate = useCallback(
    (newPage: number) => {
      setDream((entity) => {
        entity.choicesPage = newPage;
      });
    },
    [setDream]
  );

  const onCancel = useCallback(() => {
    setDream((entity) => {
      entity.outputID = undefined;
      entity.locked = false;
    });
  }, [setDream]);

  const images = Generation.Images.useFromIDs(...(output?.imageIDs ?? []));
  const current = images?.[page];

  return (
    <div
      className={classes(
        "fixed left-[50%] bottom-6 z-[10] flex -translate-x-1/2 flex-row items-center justify-center gap-3 overflow-visible"
      )}
    >
      <AnimatePresence>
        {pageCount > 1 && selected && (
          <motion.div
            className="border-brand-500 pointer-events-auto relative flex flex-col gap-3 rounded-md border-2 bg-zinc-50 p-2 text-black shadow-lg dark:bg-zinc-900 dark:text-white dark:shadow-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          >
            <div className="flex w-full flex-row gap-2">
              <Theme.Button
                color="brand"
                size="lg"
                onClick={() => current?.src && onChoose(current)}
              >
                Select
              </Theme.Button>
              <Theme.Button
                translucent
                className="hover:bg-zinc-800"
                size="lg"
                onClick={onCancel}
              >
                Cancel
              </Theme.Button>

              <div className="w-px grow bg-zinc-700" />
              <div className="flex flex-row items-center justify-between px-2 font-mono text-lg tracking-widest">
                {page + 1}
                <span className="opacity-75">/{pageCount}</span>
              </div>
              <Theme.Button
                icon={Theme.Icon.ChevronLeft}
                onClick={() => onPaginate(page > 0 ? page - 1 : pageCount - 1)}
                transparent
                size="lg"
              />
              <Theme.Button
                icon={Theme.Icon.ChevronRight}
                onClick={() => onPaginate(page >= pageCount - 1 ? 0 : page + 1)}
                transparent
                size="lg"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

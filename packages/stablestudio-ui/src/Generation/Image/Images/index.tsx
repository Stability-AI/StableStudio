import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";

import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";

import { Delete } from "./Delete";
import { Download } from "./Download";
import { Modal } from "./Modal";
import { Query } from "./Query";
import { Scroll } from "./Scroll";
import { State } from "./State";

export type Images = Generation.Image[];

export function Images({ className }: Images.Props) {
  const latestGeneration = Generation.Image.Create.Latest.use();
  const placeholderOffset = !latestGeneration ? 1 : 0;

  const outputs = Generation.Image.Outputs.use();
  const count = outputs.length + placeholderOffset;

  const { isFetching, fetchPreviousPage, hasPreviousPage } = Query.use();

  const parentRef = useRef<HTMLDivElement>(null);
  const parentOffsetRef = useRef(0);
  const scrollDownIndexRef = useRef(-1);
  const scrollingDownRef = useRef(false);
  const heightsRef = useRef<{ [index: number]: number }>({});

  useLayoutEffect(() => {
    parentOffsetRef.current = parentRef.current?.offsetTop ?? 0;
  }, []);

  const virtualizer = useVirtualizer({
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => heightsRef.current[index] ?? 400,

    count,
    scrollMargin: parentOffsetRef.current,
    paddingEnd: 40,
    overscan: 4,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const showTop = useMemo(
    () =>
      (virtualItems[0]?.index ?? 0) > 3 && scrollDownIndexRef.current === -1,
    [virtualItems]
  );

  const onScrollToTop = useCallback(() => {
    scrollDownIndexRef.current = virtualizer.scrollOffset ?? 0;
    virtualizer.scrollToOffset(0, { behavior: "smooth" });
  }, [virtualizer]);

  const onScrollBack = useCallback(() => {
    scrollingDownRef.current = true;
    virtualizer.scrollToOffset(scrollDownIndexRef.current, {
      behavior: "smooth",
      align: "start",
    });
  }, [virtualizer]);

  useEffect(() => {
    if (scrollDownIndexRef.current !== -1 && scrollingDownRef.current) {
      virtualizer.scrollToOffset(scrollDownIndexRef.current);
      if (scrollDownIndexRef.current === virtualizer.scrollOffset) {
        scrollDownIndexRef.current = -1;
        scrollingDownRef.current = false;
      }
    }
  }, [virtualItems, virtualizer]);

  useEffect(() => {
    if (showTop) {
      scrollDownIndexRef.current = -1;
    }
  }, [showTop]);

  useEffect(() => {
    const lastIndex = virtualItems[virtualItems.length - 1]?.index;
    lastIndex &&
      lastIndex >= outputs.length - 10 &&
      !isFetching &&
      hasPreviousPage &&
      fetchPreviousPage();
  }, [
    virtualItems,
    outputs.length,
    hasPreviousPage,
    isFetching,
    fetchPreviousPage,
  ]);

  const rows = useMemo(
    () =>
      virtualItems.map((virtualRow) => {
        const isPlaceholder = virtualRow.index === 0 && !!placeholderOffset;

        const outputID = outputs[virtualRow.index - placeholderOffset]?.id;
        if (!outputID && !isPlaceholder) return null;

        const layoutID = isPlaceholder
          ? Generation.Image.Outputs.nextID()
          : outputID;

        return (
          <motion.div
            key={layoutID}
            data-index={virtualRow.index}
            ref={(element) => {
              virtualizer.measureElement(element);
              if (element)
                heightsRef.current[virtualRow.index] =
                  element.getBoundingClientRect().height;
            }}
            layoutId={layoutID}
            layout="preserve-aspect"
            className={classes(
              "relative flex flex-col gap-4",
              virtualRow.index === count - 1 && "pb-12"
            )}
            initial={{ opacity: 0, y: -300 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 50,
              mass: 2,
            }}
          >
            <Generation.Image.Output
              placeholder={isPlaceholder}
              divider={virtualRow.index !== 0}
              outputID={outputID}
            />
          </motion.div>
        );
      }),
    [virtualizer, virtualItems, placeholderOffset, outputs]
  );

  return (
    <>
      <Generation.Images.Modal />
      <Generation.Images.Scroll
        onScrollToTop={onScrollToTop}
        onScrollBack={onScrollBack}
        showTop={showTop}
        showBottom={scrollDownIndexRef.current !== -1}
        outputs={outputs}
      />
      <div
        ref={parentRef}
        className={classes(
          "relative flex grow flex-col gap-4 overflow-y-auto p-6 dark:bg-zinc-800",
          className
        )}
      >
        <div
          className="relative w-full"
          style={{ height: virtualizer.getTotalSize() }}
        >
          <div
            className="absolute left-0 top-0 w-full"
            style={{
              transform: `translateY(${
                (virtualItems[0]?.start ?? 0) - virtualizer.options.scrollMargin
              }px)`,
            }}
          >
            {rows}
          </div>
        </div>
      </div>
    </>
  );
}

export declare namespace Images {
  export { Delete, Download, Modal, State, Scroll };
}

export namespace Images {
  Images.Delete = Delete;
  Images.Download = Download;
  Images.Modal = Modal;
  Images.State = State;
  Images.Scroll = Scroll;

  export type Props = Styleable & { minimum?: number };
  export type Options = {
    input?: ID;
    project?: ID;
    sortOrder: "descending" | "ascending";
  };

  export const add = (images: Images) => State.get().addImages(images);

  export const use = (): Images =>
    State.use(({ images }) => Object.values(images), GlobalState.shallow);

  export const useFromIDs = (...ids: IDs): Images =>
    State.use(
      ({ images }) =>
        ids
          .filter((id) => id !== undefined)
          .map((id) => images[id as ID])
          .filter((image): image is Generation.Image => image !== undefined),
      GlobalState.shallow
    );
}

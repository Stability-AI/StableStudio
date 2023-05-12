import { AnimatePresence, motion } from "framer-motion";
import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export function Scroll({
  onScrollToTop,
  onScrollBack,
  showTop,
  showBottom,
  outputs,
}: {
  onScrollToTop: () => void;
  onScrollBack: () => void;
  showTop: boolean;
  showBottom: boolean;
  outputs: Generation.Image.Outputs;
}) {
  const [earliestID, setEarliestID] = useState<ID | undefined>(outputs[0]?.id);

  const newOutputs = useMemo(() => {
    if (!earliestID) return [];

    const index = outputs.findIndex((output) => output.id === earliestID);
    return outputs.slice(0, index);
  }, [earliestID, outputs]);

  useEffect(() => {
    showTop && setEarliestID(outputs[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTop]);

  return (
    <AnimatePresence>
      {showTop && (
        <div
          key="top"
          className="absolute top-0 z-[999] my-3 flex w-full justify-center px-3"
        >
          <motion.div
            onClick={onScrollToTop}
            className="bg-brand-500 hover:bg-brand-400 group pointer-events-auto flex h-[2.5rem] cursor-pointer select-none items-center justify-between gap-2 rounded-lg py-1.5 px-3 backdrop-blur-lg transition-colors duration-100"
            initial={{ y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Theme.Icon.ChevronUp size={18} className="-mr-1" />
            <h1>Scroll to top</h1>
            {newOutputs.length > 0 && (
              <div className="ml-1 flex items-center">
                {newOutputs
                  .sort(
                    (b, a) =>
                      (a.requestedAt ?? a.completedAt ?? 0).valueOf() -
                      (b.requestedAt ?? b.completedAt ?? 0).valueOf()
                  )
                  .slice(0, 3)
                  .map((output, i) => (
                    <Output key={output.id} output={output} index={i} />
                  ))}
                {newOutputs.length > 3 && (
                  <div className="relative ml-1">
                    <h1 className="absolute left-0 top-[50%] ml-1 -translate-y-1/2">
                      +{newOutputs.length - 3}
                    </h1>
                    <h1 className="ml-1 font-mono opacity-0">
                      +{newOutputs.length - 3}
                    </h1>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
      {showBottom && (
        <div
          key="bottom"
          className="absolute bottom-0 z-[999] my-3 flex w-full justify-center px-3"
        >
          <motion.div
            onClick={onScrollBack}
            className="group pointer-events-auto flex h-[2.5rem] cursor-pointer select-none items-center justify-between gap-2 rounded-lg bg-zinc-900/75 py-1.5 px-3 backdrop-blur-lg transition-colors duration-100 hover:bg-zinc-900"
            initial={{ y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Theme.Icon.ChevronDown size={18} className="-mr-1" />
            <h1>Scroll back</h1>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Output({
  output,
  index,
}: {
  output: Generation.Image.Output;
  index: number;
}) {
  const images = Generation.Images.useFromIDs(...output.imageIDs);
  const firstImage = images[0];
  return (
    <div
      className="ring-brand-500 group-hover:ring-brand-400 overflow-hidden rounded-md ring-[3px] duration-100"
      style={{
        marginLeft: -4,
        zIndex: 999 - index,
      }}
    >
      <Generation.Image
        className="pointer-events-none"
        hideControls
        width={24}
        height={24}
        image={firstImage}
      />
    </div>
  );
}

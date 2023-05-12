import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useClickAway } from "react-use";
import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export function BottomBar() {
  const [open, setOpen] = useState(false);
  const { input } = Generation.Image.Session.useCurrentInput();
  const createDream = Generation.Image.Session.useCreateDream();
  const tabRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  console.log("BottomBar");

  useClickAway(tabRef, () => setOpen(false));

  if (!location.pathname.startsWith("/generate")) return null;
  return (
    <motion.div
      layoutId="bottom-bar-parent"
      className={classes(
        "fixed bottom-0 z-[100] flex max-h-screen min-h-0 w-screen flex-col rounded-t-xl border-t border-zinc-700/75 bg-zinc-900 sm:hidden"
      )}
      ref={tabRef}
    >
      <div className="relative">
        <motion.div
          layoutId="bottom-bar-open-button"
          layout="preserve-aspect"
          className="flex items-center justify-center pt-3 pb-1"
          onClick={() => setOpen(!open)}
        >
          <Theme.Icon.ChevronUp
            className={classes("text-lg text-zinc-500", open && "rotate-180")}
          />
        </motion.div>
        {open && input && (
          <motion.div
            layoutId="bottom-bar"
            layout="preserve-aspect"
            className="flex max-h-[60vh] min-h-0 shrink grow-0 flex-col overflow-y-auto"
          >
            <Generation.Image.Sidebar.Tab id={input.id} />
          </motion.div>
        )}
        {input && (
          <motion.div
            layout="preserve-aspect"
            layoutId="bottom-bar-create-button"
            className="p-2"
          >
            <Generation.Image.Create.Button
              id={input.id}
              onIdleClick={() => createDream()}
              fullWidth
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

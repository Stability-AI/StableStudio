import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useClickAway } from "react-use";

import { Theme } from "..";

import { Dropdown } from "./Dropdown";

export function Tooltip({
  children,
  contentClasses,
  content,
  placement = "top",
  delay = 0,
  distance = 8,
  allowOpen = true,
  forceOpen = false,
  showArrow = true,
  enablePointerEvents = false,
  className,
  onChange,
  openMechanism = "hover",
}: StyleableWithChildren & {
  content: React.ReactNode;
  contentClasses?: string;
  placement?: "top" | "bottom" | "left" | "right";
  delay?: number;
  distance?: number;
  allowOpen?: boolean;
  forceOpen?: boolean;
  showArrow?: boolean;
  enablePointerEvents?: boolean;
  onChange?: (open: boolean) => void;
  openMechanism?: "click" | "hover";
}) {
  const [show, setShow] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [leaveTimer, setLeaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !(show || forceOpen)) return;

    const rect = containerRef.current.getBoundingClientRect();

    switch (placement) {
      case "top":
        setPosition({
          top: rect.top - distance,
          left: rect.left + rect.width / 2,
        });
        break;
      case "bottom":
        setPosition({
          top: rect.top + rect.height + distance,
          left: rect.left + rect.width / 2,
        });
        break;
      case "left":
        setPosition({
          top: rect.top + rect.height / 2,
          left: rect.left - distance,
        });
        break;
      case "right":
        setPosition({
          top: rect.top + rect.height / 2,
          left: rect.left + rect.width + distance,
        });
        break;
    }
  }, [placement, distance, show, content, forceOpen]);

  const onMouseEnter = useCallback(() => {
    if (openMechanism !== "hover") return;

    if (timer) clearTimeout(timer);

    if (delay)
      setTimer(
        setTimeout(() => {
          setShow(true);
        }, delay)
      );
    else setShow(true);
  }, [openMechanism, timer, delay]);

  const onMouseLeave = useCallback(() => {
    if (openMechanism !== "hover") return;
    if (timer) clearTimeout(timer);

    if (enablePointerEvents) {
      if (leaveTimer) clearTimeout(leaveTimer);

      setLeaveTimer(
        setTimeout(() => {
          setShow(false);
        }, 200)
      );
    } else {
      setShow(false);
    }
  }, [enablePointerEvents, leaveTimer, openMechanism, timer]);

  const onClick = useCallback(
    (e: any) => {
      if (openMechanism !== "click") return;

      e.stopPropagation();
      setShow(true);
    },
    [openMechanism]
  );

  useClickAway(tooltipRef, () => {
    if (openMechanism !== "click") return;
    setShow(false);
  });

  const portal = useMemo(() => document.getElementById("tooltip-root"), []);

  useEffect(() => {
    if (onChange) onChange((show || forceOpen) && allowOpen);
  }, [show, onChange, forceOpen, allowOpen]);

  const isMobileDevice = Theme.useIsMobileDevice();

  if (!portal || isMobileDevice) return (children ?? null) as any;

  const tooltip = createPortal(
    <AnimatePresence>
      {(show || forceOpen) && allowOpen && (
        <>
          {showArrow && (
            <motion.div
              className={classes(
                "absolute z-[999999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-zinc-300 bg-zinc-900 dark:border-zinc-700",
                placement === "top" && "border-b border-r",
                placement === "bottom" && "border-l border-t",
                placement === "left" && "border-r border-t",
                placement === "right" && "border-b border-l"
              )}
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
              }}
              initial={{
                opacity: 0,
              }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: "tween",
                duration: 0.05,
              }}
            />
          )}
          <motion.div
            ref={tooltipRef}
            style={{
              top: `${position.top}px`,
              left: `${Math.min(
                position.left,
                window.innerWidth - (tooltipRef.current?.offsetWidth ?? 0) + 32
              )}px`,
            }}
            className={classes(
              "absolute z-[999998] block shrink-0 whitespace-nowrap rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white ring-[1px] ring-inset ring-zinc-700",
              placement === "top" &&
                "-translate-x-1/2 -translate-y-full transform",
              placement === "bottom" && "-translate-x-1/2 transform",
              placement === "left" &&
                "-translate-x-full -translate-y-1/2 transform",
              placement === "right" && "-translate-y-1/2 transform",
              enablePointerEvents
                ? "pointer-events-auto"
                : "pointer-events-none",
              contentClasses
            )}
            initial={{
              opacity: 0,
            }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "tween",
              duration: 0.05,
            }}
            css={css`
              filter: drop-shadow(0 0 0.5rem rgba(0, 0, 0, 0.5));
            `}
            onMouseEnter={() => {
              if (timer) clearTimeout(timer);
              if (leaveTimer) clearTimeout(leaveTimer);
            }}
          >
            {content}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portal
  );

  return (
    <div
      ref={containerRef}
      className={classes("relative inline-block", className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onClick}
    >
      {children}
      {tooltip}
    </div>
  );
}

export declare namespace Tooltip {
  export { Dropdown };
}

export namespace Tooltip {
  Tooltip.Dropdown = Dropdown;
}

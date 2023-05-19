import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Shortcut } from "~/Shortcut";

import { Actions } from "./Actions";
import { Description } from "./Description";
import { Panel } from "./Panel";
import { Title } from "./Title";
import { TopBar } from "./TopBar";

const outSideVariants = {
  closed: {
    opacity: 0,
    transition: {
      type: "tween",
      duration: 0.1,
    },
  },
  open: {
    opacity: 1,
    transition: {
      type: "tween",
      duration: 0.1,
    },
  },
};

const insideVariants = {
  closed: {
    scale: 0.9,
    opacity: 0,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 500,
      restSpeed: 10,
    },
  },
  open: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 22,
      stiffness: 500,
      restSpeed: 0.1,
    },
  },
};

export function Modal(
  props: StyleableWithChildren & {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    modalName: string;
  }
) {
  const root = useMemo(() => document.getElementById("modal-root"), []);
  if (!root) {
    console.error("Could not find root element");
    return null;
  }

  const content = (
    <AnimatePresence>{props.open && <Open {...props} />}</AnimatePresence>
  );

  return createPortal(content, root);
}

function Open({
  open,
  onClose,
  children,
  className,
  modalName,
}: StyleableWithChildren & {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  modalName: string;
}) {
  Shortcut.use(
    useMemo(
      () => ({
        menu: false,
        name: [`${modalName} Modal`, "Close"],
        keys: "Escape",
        action: () => {
          onClose();
        },
      }),
      [modalName, onClose]
    )
  );

  return (
    <motion.div
      className={classes(
        "fixed top-0 left-0 z-[1000] flex h-full w-full bg-black/75 sm:h-screen sm:w-screen sm:items-center sm:justify-center",
        !open && "pointer-events-none"
      )}
      variants={outSideVariants}
      initial="closed"
      animate={open ? "open" : "closed"}
      exit="closed"
      onClick={onClose}
    >
      <motion.div
        className={classes(!open && "pointer-events-none", className)}
        variants={insideVariants}
        initial="closed"
        animate={open ? "open" : "closed"}
        exit="closed"
        onClick={(e) => e.stopPropagation()}
      >
        {open && children}
      </motion.div>
    </motion.div>
  );
}

export declare namespace Modal {
  export { Modal, Panel, Title, Description, Actions, TopBar };
}

export namespace Modal {
  Modal.Panel = Panel;
  Modal.Title = Title;
  Modal.Description = Description;
  Modal.Actions = Actions;
  Modal.TopBar = TopBar;
}

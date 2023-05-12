import * as ReactDOM from "react-dom";

import { GlobalState } from "~/GlobalState";

export function Center({ className, children }: StyleableWithChildren) {
  const setElement = State.use(({ setElement }) => setElement);
  return (
    <div
      ref={setElement}
      className={classes(
        "flex h-full grow basis-0 items-center justify-center",
        className
      )}
    >
      {children}
    </div>
  );
}

export namespace Center {
  export function Set({ children }: React.PropsWithChildren) {
    const element = State.use(({ element }) => element, GlobalState.shallow);
    return <>{element && ReactDOM.createPortal(children, element)}</>;
  }
}

type State = {
  element?: HTMLDivElement | null;
  setElement: (element?: HTMLDivElement | null) => void;
};

namespace State {
  export const use = GlobalState.create<State>((set) => ({
    setElement: (element) => set({ element }),
  }));
}

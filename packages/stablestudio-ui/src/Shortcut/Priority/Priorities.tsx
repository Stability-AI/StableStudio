import { GlobalState } from "~/GlobalState";
import { Shortcut } from "~/Shortcut";

export type Priorities = Shortcut.Priority[];

export namespace Priorities {
  export const use = () => {
    const state = State.use(({ priorities }) => ({ priorities }));
    return useMemo(() => [...state.priorities.values()], [state.priorities]);
  };

  export const useSet = () =>
    State.use(({ setPriorities }) => ({ setPriorities })).setPriorities;
}

type State = {
  priorities: Map<ID, Shortcut.Priority>;
  setPriorities: (
    setPriorities: React.SetStateAction<Map<ID, Shortcut.Priority>>
  ) => void;
};

namespace State {
  export const use = GlobalState.create<State>((set) => ({
    priorities: new Map(),
    setPriorities: (setPriorities) =>
      set(({ priorities }) => ({
        priorities: new Map(
          typeof setPriorities === "function"
            ? setPriorities(priorities)
            : setPriorities
        ),
      })),
  }));
}

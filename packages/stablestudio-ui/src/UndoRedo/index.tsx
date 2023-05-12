import { temporal } from "zundo";
import { StoreApi, UseBoundStore, create as zustand_default } from "zustand";

import { Shortcuts } from "./Shortcut";

export declare namespace UndoRedo {
  export { Shortcuts };
}

export namespace UndoRedo {
  UndoRedo.Shortcuts = Shortcuts;

  type Initializer<State> = (set: Store<State>["setState"]) => State;
  type Store<State> = Omit<StoreApi<State>, "destroy">;
  type StoreHook<State> = UseBoundStore<StoreApi<State>>;

  export const use = () => {
    const { undo, redo } = State.use.temporal.getState();
    return useMemo(() => ({ undo, redo }), [undo, redo]);
  };

  export function create<S extends TrackedState>(
    initializer: Initializer<S>
  ): StoreHook<S> {
    const key = ID.create();

    type Set = Store<S>["setState"];
    type Get = Store<S>["getState"];
    type Subscribe = Store<S>["subscribe"];

    const get: Get = () => State.use.getState().trackedStates[key] as S;
    const set: Set = (setState: S) =>
      State.use.getState().setTrackedState(key, setState);

    const subscribe: Subscribe = (listener) =>
      State.use.subscribe(({ trackedStates }, previous) =>
        listener(trackedStates[key] as S, previous.trackedStates[key] as S)
      );

    const clear = () => State.use.temporal.getState().clear();
    const initialize = () =>
      State.use.getState().setTrackedState(key, initializer(set));

    const store: Store<S> = {
      setState: set,
      getState: get,
      subscribe,
    };

    initialize();
    clear();

    return zustand_default(store as never);
  }
}

type State = {
  trackedStates: TrackedStates;
  setTrackedState: SetTrackedState;
};

type TrackedStates = Record<ID, TrackedState>;
type TrackedState = Record<string, unknown>;
type SetTrackedState = (
  id: ID,
  setState: React.SetStateAction<TrackedState | undefined>
) => void;

namespace State {
  export const use = zustand_default(
    temporal<State>(
      (set) => ({
        trackedStates: {},
        setTrackedState: (key, setState) =>
          set(({ trackedStates }) => {
            const state = trackedStates[key];
            const previous = typeof state === "object" ? state : {};
            const updated =
              typeof setState === "function" ? setState(state) : setState;

            return {
              trackedStates: {
                ...trackedStates,
                [key]: { ...previous, ...updated },
              },
            };
          }),
      }),
      {
        limit: 1000,
        handleSet: (handleSet) => throttle(handleSet, 1000),
      }
    )
  );
}

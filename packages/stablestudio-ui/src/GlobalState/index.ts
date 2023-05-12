import {
  StoreApi,
  UseBoundStore,
  create as zustandDefault,
  useStore as zustandUseStore,
} from "zustand";

import { shallow as zustandShallow } from "zustand/shallow";

export type GlobalState<A> = UseBoundStore<StoreApi<A>>;
export namespace GlobalState {
  export type Store<State> = StoreApi<State>;
  export type Selector<State, Selection> = (
    state: ExtractState<State>
  ) => Selection;

  type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

  export const create = zustandDefault;
  export const shallow = zustandShallow;

  export const useStore = zustandUseStore;
}

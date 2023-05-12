import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";
import { UndoRedo } from "~/UndoRedo";

export type Inputs = { [id: string]: Generation.Image.Input };

export namespace Inputs {
  export const get = () => State.use.getState().inputs;
  export const set = (...args: Parameters<State["setInputs"]>) =>
    State.use.getState().setInputs(...args);

  export const copy = (oldID: ID, newID: ID) =>
    set((inputs) => {
      const previous = inputs[oldID];
      return {
        ...inputs,
        ...(previous && { [newID]: { ...previous, id: newID } }),
      };
    });

  export const use = () => {
    const inputs = State.use(({ inputs }) => inputs, GlobalState.shallow);
    return React.useMemo(() => [inputs, set] as const, [inputs]);
  };

  export const useFromIDs = (...ids: IDs) =>
    State.use(({ inputs }) => ids.map((id) => inputs[id]), GlobalState.shallow);

  export type State = {
    inputs: Inputs;
    setInputs: React.Dispatch<React.SetStateAction<Inputs>>;
  };

  export namespace State {
    export const use = UndoRedo.create<State>((set) => ({
      inputs: {} as Inputs,
      setInputs: (setInputs) =>
        set(({ inputs }) => ({
          inputs:
            typeof setInputs === "function" ? setInputs(inputs) : setInputs,
        })),
    }));
  }
}

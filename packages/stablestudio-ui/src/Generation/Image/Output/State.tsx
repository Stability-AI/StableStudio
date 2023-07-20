import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";

export type State = {
  outputs: Record<ID, Generation.Image.Output>;
  setOutputs: (outputs: Generation.Image.Output[]) => void;

  nextID: ID;

  requested: (
    inputID: ID,
    modifiers?: Generation.Image.Input.Modifiers,
    nextID?: ID
  ) => Generation.Image.Output;

  received: (
    id: ID,
    result: Generation.Image.Exception | Generation.Images
  ) => void;

  remove: (ids: ID[]) => void;
  clear: (id: ID) => void;
};

export namespace State {
  const store = GlobalState.create<State>((set, get) => ({
    outputs: {},
    setOutputs: (outputs) =>
      set((state) => ({
        outputs: {
          ...state.outputs,
          ...outputs.reduce(
            (outputs, output) => ({ ...outputs, [output.id]: output }),
            {}
          ),
        },
      })),

    nextID: ID.create(),

    requested: (inputID, modifiers, nextID) => {
      const id = nextID ?? get().nextID;
      const output = {
        id,
        inputID,

        requestedAt: new Date(),
        completedAt: undefined,

        count: modifiers?.count ?? Generation.Image.Count.get(),
        imageIDs: [],
      };

      set((state) => ({
        nextID: ID.create(),
        outputs: { ...state.outputs, [id]: output },
      }));

      Generation.Image.Input.set(inputID, (input) => ({
        ...input,
        ...modifiers,
      }));

      return output;
    },

    remove: (ids: ID[]) => {
      set((state) => {
        const outputs = { ...state.outputs };
        Object.values(outputs)
          .filter((o) => o.imageIDs.length > 0)
          .forEach((output) => {
            output.imageIDs = output.imageIDs.filter((id) => !ids.includes(id));
            output.count = output.imageIDs.length;

            if (output.imageIDs.length === 0) delete outputs[output.id];
            else outputs[output.id] = output;
          });
        return { ...state, outputs };
      });
    },

    received: (id, result) =>
      set((state) => {
        const previous = state.outputs[id];
        return {
          outputs: {
            ...state.outputs,
            ...(previous && {
              [id]: {
                ...previous,

                completedAt: new Date(),
                imageIDs: [],

                ...(Generation.Image.Exception.is(result)
                  ? { exception: result }
                  : { imageIDs: result.map((image) => image.id) }),
              },
            }),
          },
        };
      }),

    clear: (id) =>
      set((state) => {
        const outputs = { ...state.outputs };
        delete outputs[id];
        return { ...state, outputs };
      }),
  }));

  export const use = store;
  export const get = store.getState;
}

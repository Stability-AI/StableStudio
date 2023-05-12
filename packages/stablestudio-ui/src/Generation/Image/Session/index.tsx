import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";

export namespace Session {
  export const getCurrentInput = () =>
    Generation.Image.Input.get(State.use.getState().currentInputID);

  export const setCurrentInput = (
    setCurrentInput: Parameters<typeof Generation.Image.Input.set>[1]
  ) => {
    const inputID = getCurrentInput()?.id;
    inputID && Generation.Image.Input.set(inputID, setCurrentInput);
  };

  export const useCurrentInput = () => {
    const id = State.use(
      ({ currentInputID }) => currentInputID,
      GlobalState.shallow
    );

    return Generation.Image.Input.use(id);
  };

  export const useLastInput = () => {
    const id = State.use(({ previousInputIDs: [lastInputID] }) => lastInputID);
    return Generation.Image.Input.use(id);
  };

  export const useInputIDs = () =>
    State.use(
      ({ currentInputID, previousInputIDs }) => [
        currentInputID,
        ...previousInputIDs,
      ],
      GlobalState.shallow
    );

  export const useReset = () => State.use(({ reset }) => reset);

  export const useImageFilter = () => {
    const ids = useInputIDs();
    return useCallback(
      (image: Generation.Image, invert = false) =>
        ids.includes(image.inputID) !== invert,
      [ids]
    );
  };

  export const useSetLastStrength = () =>
    State.use(({ setLastStrength }) => setLastStrength);

  export const useSetInitialImage = () => {
    const lastStrength = State.use(({ lastStrength }) => lastStrength);

    return useCallback(
      (image?: string | Generation.Image) => {
        setCurrentInput((input) => {
          const src = typeof image === "string" ? image : image?.src;
          if (!src) return;

          input.strength = lastStrength;
          input.init = {
            src,
            mask: false,
            weight: 1,
          };
        });
      },
      [lastStrength]
    );
  };

  export const useCreateDream = () => {
    const createGeneration = Generation.Image.Create.use();
    return useCallback(
      async (modifiers?: Generation.Image.Input.Modifiers) => {
        const input = getCurrentInput();
        if (!input) return;

        State.get().newCurrentInput();

        return createGeneration({ inputID: input.id, modifiers });
      },
      [createGeneration]
    );
  };

  export const useCreateVariations = (image?: Generation.Image) => {
    const createDream = useCreateDream();

    return useCallback(async () => {
      if (!image) return;

      const { currentInputID, lastStrength, setVariationsSourceImage } =
        State.get();

      const sourceInput = Generation.Image.Input.get(image.inputID);
      if (!sourceInput) return;

      const prompts = sourceInput.prompts.filter(
        (prompt) => prompt.text !== ""
      );
      if (prompts.filter((prompt) => prompt.weight < 0).length <= 0)
        prompts.push({ text: "", weight: -0.75 });

      setVariationsSourceImage(image);
      Generation.Image.Input.set(currentInputID, () => ({
        ...sourceInput,

        id: currentInputID,
        strength: lastStrength,

        prompts,
        seed: 0,

        ...(image.src && {
          init: {
            src: image.src,
            mask: false,
            weight: 1,
          },
        }),
      }));

      return createDream();
    }, [image, createDream]);
  };

  export const useUpscale = (image?: Generation.Image) => {
    const createDream = useCreateDream();
    const [upscaler] = Generation.Image.Upscale.use();

    return useCallback(async () => {
      if (!image) return;

      const { setVariationsSourceImage } = State.get();

      const sourceInput = Generation.Image.Input.get(image.inputID);
      if (!sourceInput) return;

      setVariationsSourceImage(image);
      const upscaleScale = Generation.Image.Upscale.getScale(upscaler);

      return createDream({
        prompts: sourceInput.prompts.filter((prompt) => prompt.text !== ""),
        strength: 1,
        width: sourceInput.width * upscaleScale,
        height: sourceInput.height * upscaleScale,
        count: 1,
        model: upscaler,
        ...(image.src && {
          init: {
            src: image.src,
            mask: false,
            weight: 1,
          },
        }),
      });
    }, [image, createDream, upscaler]);
  };
}

type State = {
  currentInputID: ID;
  newCurrentInput: () => void;

  previousInputIDs: IDs;

  lastStrength: number;
  setLastStrength: (lastStrength: number) => void;

  variationsSourceImage?: Generation.Image;
  setVariationsSourceImage: (image?: Generation.Image) => void;

  reset: () => void;
};

namespace State {
  export const get = () => use.getState();

  export const use = GlobalState.create<State>((set) => {
    const initial = () => ({
      currentInputID: ID.create(),
      newCurrentInput: () => {
        const newID = ID.create();

        set((state) => {
          Generation.Image.Inputs.copy(state.currentInputID, newID);
          return {
            currentInputID: newID,
            previousInputIDs: [state.currentInputID, ...state.previousInputIDs],
          };
        });

        return { newID };
      },

      generatingInputID: undefined,
      previousInputIDs: [],

      lastStrength: 0.35,
      setLastStrength: (lastStrength: number) => set({ lastStrength }),

      variationsSourceImage: undefined,
      setVariationsSourceImage: (image?: Generation.Image) =>
        set({ variationsSourceImage: image }),

      reset: () => set(initial, true),
    });

    return initial();
  });
}

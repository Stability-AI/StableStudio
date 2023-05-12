import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";

export type Dragging = { image?: Generation.Image };

export namespace Dragging {
  export const useImage = () => State.use(({ image }) => image);

  export const useStart = () => {
    const setImage = State.use(({ setImage }) => setImage);
    return useCallback(
      (image?: Generation.Image) => setImage(image),
      [setImage]
    );
  };

  export const useStop = () => {
    const setImage = State.use(({ setImage }) => setImage);
    return useCallback(
      (_image?: Generation.Image) => setImage(undefined),
      [setImage]
    );
  };
}

type State = {
  image?: Generation.Image;
  setImage: (image?: Generation.Image) => void;
};

namespace State {
  export const use = GlobalState.create<State>((set) => ({
    image: undefined,
    setImage: (image?: Generation.Image) => set({ image }),
  }));
}

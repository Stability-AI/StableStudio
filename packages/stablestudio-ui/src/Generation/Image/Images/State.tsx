import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";

export type State = {
  images: Record<ID, Generation.Image>;
  addImages: (images: Generation.Images) => void;
};

export namespace State {
  const store = GlobalState.create<State>((set) => ({
    images: {},
    addImages: (images) =>
      set((state) => ({
        images: {
          ...state.images,
          ...images.reduce(
            (images, image) => ({ ...images, [image.id]: image }),
            {}
          ),
        },
      })),
  }));

  export const get = store.getState;
  export const use = store;
}

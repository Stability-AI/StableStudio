import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";
import { Theme } from "~/Theme";

import { Content } from "./Content";

export function Modal() {
  const [image, setImage] = Modal.useImage();
  return (
    <Theme.Modal modalName="Image" open={!!image} onClose={() => setImage()}>
      {image && (
        <Theme.Modal.Panel className="flex h-full min-h-0 w-full overflow-y-auto sm:max-h-[calc(100vh-5rem)] sm:max-w-[calc(100vw-5rem)] sm:grow">
          <Theme.Modal.TopBar onClose={() => setImage()} />
          <Content
            image={image}
            setImage={setImage}
            onClose={() => setImage()}
          />
        </Theme.Modal.Panel>
      )}
    </Theme.Modal>
  );
}

export declare namespace Modal {
  export { Content };
}

export namespace Modal {
  Modal.Content = Content;

  export const useImage = () =>
    State.use(
      ({ image, setImage }) => [image, setImage] as const,
      GlobalState.shallow
    );

  type State = {
    image?: Generation.Image;
    setImage: (image?: Generation.Image) => void;
  };

  namespace State {
    export const use = GlobalState.create<State>((set) => ({
      setImage: (image) => set((state) => ({ ...state, image })),
    }));
  }
}

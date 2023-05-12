import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";
import { Theme } from "~/Theme";

export function Modal() {
  const closeModal = Modal.useClose();
  const { image, open, setImage } = State.use(
    ({ image, open, setImage }) => ({ image, open, setImage }),
    GlobalState.shallow
  );

  return (
    <Theme.Modal modalName="Images" open={open} onClose={closeModal}>
      <Theme.Modal.Panel className="flex h-full w-full grow overflow-hidden overflow-y-auto sm:max-h-[calc(100vh-5rem)] sm:max-w-[calc(100vw-5rem)]">
        <Theme.Modal.TopBar onClose={closeModal} />
        <Generation.Image.Modal.Content
          image={image}
          setImage={setImage}
          onClose={closeModal}
        />
      </Theme.Modal.Panel>
    </Theme.Modal>
  );
}

export namespace Modal {
  export const useClose = () => {
    const { setOpen, setImage } = State.use(
      ({ setOpen, setImage }) => ({
        setOpen,
        setImage,
      }),
      GlobalState.shallow
    );

    return useCallback(() => {
      setOpen(false);
      setImage();
    }, [setOpen, setImage]);
  };

  export const useOpen = () => {
    const { setOpen, setImage } = State.use(
      ({ setOpen, setImage }) => ({ setOpen, setImage }),
      GlobalState.shallow
    );

    return useCallback(
      (image?: Generation.Image) => {
        setImage(image);
        setOpen(true);
      },
      [setOpen, setImage]
    );
  };
}

type State = {
  open: boolean;
  setOpen: (open: boolean) => void;

  image?: Generation.Image;
  setImage: (image?: Generation.Image) => void;
};

export namespace State {
  export const use = GlobalState.create<State>((set) => ({
    open: false,
    setOpen: (open) => set({ open }),
    setImage: (image) => set({ image }),
  }));
}

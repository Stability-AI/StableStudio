import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";
import { Theme } from "~/Theme";

export function Modal() {
  const {
    image,
    open,
    name,
    description,
    setImage,
    setName,
    setOpen,
    setDescription,
  } = Modal.State.use();
  const [saving, setSaving] = useState(false);

  return (
    <Theme.Modal
      modalName="Download"
      open={open}
      onClose={() => setOpen(false)}
    >
      <Theme.Modal.Panel className="flex w-[25rem] grow">
        <Theme.Modal.TopBar onClose={() => setOpen(false)}>
          <Theme.Modal.Title className="text-lg">
            Save workflow
          </Theme.Modal.Title>
        </Theme.Modal.TopBar>
        <div className="flex flex-col gap-3 p-2">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <Theme.Label className="mb-0 ml-0">Name</Theme.Label>
              <Theme.Input
                fullWidth
                placeholder="Name"
                value={name}
                onChange={setName}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Theme.Label className="mb-0 ml-0">Description</Theme.Label>
              <Theme.Input
                fullWidth
                autoSize
                placeholder="Description"
                value={description}
                onChange={setDescription}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Theme.Label className="mb-0 ml-0">Icon</Theme.Label>
              <input
                type={"file"}
                accept={"image/*"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const result = e.target?.result;
                    if (typeof result !== "string") return;

                    setImage(result);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>
          </div>
          <Theme.Button
            fullWidth
            size="lg"
            color="brand"
            icon={Theme.Icon.Download}
            loading={saving}
            onClick={async () => {
              if (!image || !name) return;

              setSaving(true);
              try {
                await Generation.Image.Workflow.saveWorkflow(
                  name,
                  image,
                  description
                );
              } finally {
                setSaving(false);
              }
              setOpen(false);
            }}
          >
            Save
          </Theme.Button>
        </div>
      </Theme.Modal.Panel>
    </Theme.Modal>
  );
}

export namespace Modal {
  export type State = {
    image?: string | null;
    name: string;
    open: boolean;
    description: string;

    setImage: (image?: string) => void;
    setName: (name: string) => void;
    setOpen: (open: boolean) => void;
    setDescription: (description: string) => void;
  };

  export namespace State {
    export const use = GlobalState.create<State>((set) => ({
      image: null,
      name: "",
      open: false,
      description: "",

      setImage: (image) => set({ image }),
      setName: (name) => set({ name }),
      setOpen: (open) => set({ open, name: "", image: null, description: "" }),
      setDescription: (description) => set({ description }),
    }));
  }
}

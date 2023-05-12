import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";
import { Theme } from "~/Theme";

export function Modal() {
  const { image, setImage, fileName, setFileName, upscale, setUpscale } =
    Modal.State.use();

  const doUpscale = Generation.Image.Session.useUpscale(image);
  const [upscaling, setUpscaling] = useState(false);
  const download = Generation.Image.Download.use(image);

  const input = image && Generation.Image.Input.get(image.inputID);
  const alreadyUpscaled = Generation.Image.Input.isUpscaling(
    input || ({} as Generation.Image.Input)
  );

  useEffect(() => {
    if (image) {
      input && setFileName(Generation.Image.Download.fileName(input));
      setUpscale(alreadyUpscaled);
    }
  }, [alreadyUpscaled, image, input, setFileName, setUpscale]);

  const onUpscale = useCallback(async () => {
    if (!image) return;

    setUpscaling(true);
    const result = await doUpscale();

    setUpscaling(false);

    if (Array.isArray(result)) {
      return result[0];
    }
  }, [doUpscale, image]);

  const goingToUpscale = upscale && !alreadyUpscaled;

  return (
    <Theme.Modal modalName="Download" open={!!image} onClose={() => setImage()}>
      {image && (
        <Theme.Modal.Panel className="flex w-[25rem] grow">
          <Theme.Modal.TopBar onClose={() => setImage()}>
            <Theme.Modal.Title className="text-lg">Download</Theme.Modal.Title>
          </Theme.Modal.TopBar>
          <div className="flex flex-col gap-3 p-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Theme.Label className="mb-0 ml-0">File name</Theme.Label>
                <Theme.Input
                  fullWidth
                  onFocus={(e) => {
                    // select all but file extension
                    const value = e.target.value;
                    const extension = value.slice(value.lastIndexOf("."));
                    e.target.setSelectionRange(
                      0,
                      value.length - extension.length
                    );
                  }}
                  placeholder="File name"
                  value={fileName}
                  onChange={setFileName}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Theme.Label className="mb-0 ml-0">Upscale</Theme.Label>
                <Theme.Dropdown
                  fullWidth
                  className="mx-0"
                  options={[
                    { label: "1x", value: "1x" },
                    { label: "2x", value: "2x" },
                  ]}
                  value={upscale ? "2x" : "1x"}
                  onChange={(value) => setUpscale(value.value === "2x")}
                  disabled={alreadyUpscaled}
                />
              </div>
            </div>
            {/* {goingToUpscale && (
              <div className="flex w-full flex-col gap-4">
                <Generation.Image.Upscale.Sidebar />
              </div>
            )} */}
            <Theme.Button
              fullWidth
              size="lg"
              color="brand"
              icon={Theme.Icon.Download}
              loading={upscaling}
              badgeRight={
                goingToUpscale && <Theme.Badge color="brand">0.2</Theme.Badge>
              }
              onClick={() => {
                if (!image || !input) return;

                if (goingToUpscale) {
                  onUpscale().then((image) => {
                    image && download(image);

                    setImage();
                  });
                } else {
                  download();
                  setImage();
                }
              }}
            >
              {upscaling
                ? "Upscaling..."
                : goingToUpscale
                ? "Upscale and download"
                : "Download"}
            </Theme.Button>
          </div>
        </Theme.Modal.Panel>
      )}
    </Theme.Modal>
  );
}

export namespace Modal {
  export type State = {
    image?: Generation.Image;
    fileName?: string;
    upscale: boolean;
    setImage: (image?: Generation.Image) => void;
    setFileName: (fileName?: string) => void;
    setUpscale: (upscale: boolean) => void;
  };

  export namespace State {
    export const use = GlobalState.create<State>((set) => ({
      setImage: (image) => set((state) => ({ ...state, image })),
      setFileName: (fileName) => set((state) => ({ ...state, fileName })),
      setUpscale: (upscale) => set((state) => ({ ...state, upscale })),
      upscale: false,
    }));
  }
}

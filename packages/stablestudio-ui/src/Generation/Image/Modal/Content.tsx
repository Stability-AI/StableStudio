import { Editor } from "~/Editor";
import { Generation } from "~/Generation";
import { Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export function Content({
  image,
  setImage,
  onClose,
}: {
  image?: Generation.Image;
  setImage: (image?: Generation.Image) => void;
  onClose?: () => void;
}) {
  const [loading, setLoading] = useState(true);

  const images = Generation.Images.use();
  const { input } = Generation.Image.Input.use(image?.inputID);

  const areModelsEnabled = Generation.Image.Models.useAreEnabled();
  const areStylesEnabled = Generation.Image.Styles.useAreEnabled();

  const style = Generation.Image.Style.useFromID(input?.extras?.$IPC?.preset);
  const createVariations = Generation.Image.Session.useCreateVariations(image);
  const setInitImg = Generation.Image.Session.useSetInitialImage();
  const sendToEditor = Editor.Import.use(image);
  const download = Generation.Image.Download.use(image);

  useEffect(() => {
    if (image?.src) {
      const img = new Image();
      img.src = image.src;
      img.onload = () => setLoading(false);
      setLoading(true);
    }
  }, [image?.src]);

  const index = useMemo(
    () => images.findIndex((i) => i.src === image?.src),
    [image?.src, images]
  );

  const goToPreviousImage = useCallback(() => {
    if (index > -1) {
      const nextIndex = index - 1;
      if (images[nextIndex]) setImage(images[nextIndex]);
    }
  }, [index, images, setImage]);

  const goToNextImage = useCallback(() => {
    if (index > -1) {
      const nextIndex = index + 1;
      if (images[nextIndex]) setImage(images[nextIndex]);
    }
  }, [index, images, setImage]);

  Shortcut.use(
    useMemo(
      () => ({
        name: ["Navigate", "Previous Image"],
        keys: ["ArrowLeft"],
        action: goToPreviousImage,
      }),
      [goToPreviousImage]
    )
  );

  Shortcut.use(
    useMemo(
      () => ({
        name: ["Navigate", "Next Image"],
        keys: ["ArrowRight"],
        action: goToNextImage,
      }),
      [goToNextImage]
    )
  );

  const ratioString = useMemo(() => {
    if (input?.width && input?.height) {
      const gcd = (a: number, b: number): number => {
        if (!b) {
          return a;
        }

        return gcd(b, a % b);
      };

      const simplified = gcd(input.width, input.height);
      const simplifiedWidth = input.width / simplified;
      const simplifiedHeight = input.height / simplified;

      return `${simplifiedWidth} : ${simplifiedHeight}`;
    }

    return "";
  }, [input?.width, input?.height]);

  const onCreateVariations = useCallback(() => {
    onClose?.();
    createVariations();
  }, [onClose, createVariations]);

  if (!image || !input) return null;
  return (
    <div className="flex max-h-screen min-h-0 w-fit flex-col gap-4 overflow-y-auto p-4 sm:flex-row">
      <div className="group relative flex aspect-square shrink-0 grow flex-col justify-center overflow-hidden rounded bg-black/75 sm:min-h-0 sm:shrink sm:basis-0">
        <img
          src={image.src}
          className={classes(
            "h-full w-full grow basis-0 object-contain duration-100 sm:h-[999999px] sm:min-h-0 sm:w-[999999px]",
            loading ? "opacity-0" : "opacity-100"
          )}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Theme.Loading.Spinner className="h-10 w-10" />
          </div>
        )}
        {images.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-2 opacity-0 duration-100 group-hover:opacity-100">
            <Theme.Button
              className="pointer-events-auto"
              icon={Theme.Icon.ChevronLeft}
              disabled={loading || index <= 0}
              onClick={goToPreviousImage}
            />
            <Theme.Button
              className="pointer-events-auto"
              icon={Theme.Icon.ChevronRight}
              disabled={loading || index === -1 || index === images.length - 1}
              onClick={goToNextImage}
            />
          </div>
        )}
      </div>
      <div className="flex min-h-0 shrink-0 flex-col gap-4 overflow-y-auto overflow-x-hidden sm:max-w-[22rem]">
        <div className="flex flex-col gap-4 border-b border-zinc-800 pb-4">
          {input.prompts
            .filter((i) => i.text)
            .map(
              (prompt, index) =>
                "text" in prompt &&
                prompt.text &&
                input && (
                  <div className="flex flex-col gap-2" key={index}>
                    <h1 className="opacity-muted select-none">
                      {input.prompts.length > 1
                        ? prompt.weight > 0
                          ? `Prompt ${index + 1}`
                          : "Negative prompt"
                        : "Prompt"}
                    </h1>
                    <p>{prompt.text}</p>
                  </div>
                )
            )}
        </div>
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex flex-row items-center gap-1">
            <Generation.Image.Variations.Create.Button
              outline
              id={input.id}
              onClick={onCreateVariations}
              className="shrink-0"
              noTitle
            />
            <Theme.Button
              outline
              icon={Theme.Icon.Edit}
              label="Edit image"
              onClick={sendToEditor}
            />
            <Theme.Button
              outline
              icon={Theme.Icon.Image}
              disabled={loading}
              label="Set as init image"
              onClick={() => {
                setInitImg(image.src);
                onClose?.();
              }}
            />
            <Generation.Image.Prompt.Reuse.Button
              inputID={input.id}
              onClick={onClose}
            />
            <Theme.Button
              outline
              icon={Theme.Icon.Download}
              disabled={loading}
              label="Download"
              onClick={() => download()}
            />
          </div>
        </div>
        {((areModelsEnabled && input.model) || (areStylesEnabled && style)) && (
          <div className="flex flex-wrap gap-1">
            {areModelsEnabled && input.model && <Tag>{input.model}</Tag>}
            {areStylesEnabled && style && (
              <Tag className="flex items-center gap-1">
                {style.image && (
                  <img
                    src={style.image}
                    className="h-4 w-4 rounded"
                    alt={style.name}
                  />
                )}
                <h1>{style.name}</h1>
              </Tag>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field name="Ratio" value={ratioString} />
          <Field name="Size" value={`${input.width} × ${input.height}`} />
          {!Generation.Image.Input.isUpscaling(input) && (
            <>
              {input.cfgScale && (
                <Field
                  name="Prompt strength"
                  value={input.cfgScale?.toString()}
                />
              )}
              {input.seed && (
                <Field name="Seed" value={input.seed?.toString()} />
              )}
              <Field name="Steps" value={input.steps.toString()} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  name,
  value,
  className,
}: Styleable & { name: React.ReactNode; value: string }) {
  return (
    <h1 className={classes("flex flex-row items-center gap-2", className)}>
      {typeof name === "string" ? (
        <span className="opacity-muted select-none">{name}</span>
      ) : (
        name
      )}
      <span className="text-white/90">{value}</span>
    </h1>
  );
}

function Tag({ children, className }: StyleableWithChildren) {
  return (
    <span
      className={classes(
        "w-fit rounded border border-zinc-800 px-1.5 py-0.5 text-sm",
        className
      )}
    >
      {children}
    </span>
  );
}

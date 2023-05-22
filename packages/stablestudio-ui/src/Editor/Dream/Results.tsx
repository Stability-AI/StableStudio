import { Editor } from "~/Editor";
import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

function Choice({
  choice,
  onChoose,
  filtered,
}: {
  choice: string;
  onChoose: () => void;
  filtered?: boolean;
}) {
  const [currentSrc, setCurrentSrc] = useState(choice);

  useEffect(() => {
    const i = new Image();
    i.src = choice;
    i.onload = () => setCurrentSrc(choice);
  }, [choice]);

  return (
    <div
      key={choice}
      className="group relative z-[0] h-full w-full cursor-pointer select-none overflow-hidden"
    >
      <div className="relative">
        <img
          src={currentSrc}
          className="h-full w-full select-none object-cover"
        />
        <img
          src={currentSrc}
          className="absolute left-0 top-0 h-full w-full select-none object-cover opacity-0 duration-150 group-hover:opacity-100"
          css={css`
            mask: linear-gradient(black 50%, transparent 90%);
            backdrop-filter: blur(20px);
          `}
        />
        {filtered && <Generation.Image.SpecialEffects.Filter />}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-gradient-to-t from-black/50 to-transparent pb-2 opacity-0 duration-150 group-hover:opacity-100">
        <div className="pointer-events-auto flex flex-row items-center justify-center overflow-hidden rounded bg-zinc-50 text-black/75 text-opacity-50 dark:bg-zinc-800 dark:text-white/75">
          <button
            type="button"
            onClick={onChoose}
            className="relative items-center px-2 py-2 hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Theme.Icon.Check size={20} />
          </button>
          {/* <button
            type="button"
            className="relative items-center border-x border-zinc-200 px-2 py-2 hover:bg-black/10 dark:border-zinc-700 dark:hover:bg-white/10"
          >
            <Theme.Icon.RefreshClockwise size={20} />
          </button> */}
          <button
            type="button"
            className="relative items-center px-2 py-2 hover:bg-black/10 dark:hover:bg-white/10"
            onClick={() => {
              const link = document.createElement("a");
              link.download = "dream.png";
              link.href = choice;
              link.click();
              link.remove();
            }}
          >
            <Theme.Icon.Download size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Results({ id }: { id: ID }) {
  const [entity] = Editor.Entity.use<Editor.Dream>(id);
  const onChoose = Editor.Dream.Choose.use(id);
  const output = Generation.Image.Output.use(entity?.outputID);

  const pageSize =
    output &&
    entity &&
    (output?.imageIDs?.length ?? 0) >= Results.pageSize() &&
    entity?.lastMode === "txt2img"
      ? Results.pageSize()
      : 1;

  const images = Generation.Images.useFromIDs(
    ...(output && entity
      ? output?.imageIDs?.slice(
          (entity.choicesPage ?? 0) * pageSize,
          ((entity.choicesPage ?? 0) + 1) * pageSize
        ) ?? []
      : [])
  );

  const firstImage = images[0];
  if (!entity || !firstImage) return null;

  if (images && images.length === 1 && firstImage.src) {
    return (
      <Choice
        choice={firstImage.src}
        onChoose={() => onChoose(firstImage)}
        filtered={false}
      />
    );
  }

  return (
    <div
      className={classes(
        "grid grid-cols-2 grid-rows-2 gap-2",
        images &&
          images.length > 1 &&
          "pointer-events-auto bg-zinc-300 p-2 dark:bg-zinc-900"
      )}
    >
      {images &&
        images
          .filter((choice) => choice.src)
          .map((choice) => (
            <Choice
              key={choice.src}
              choice={choice.src as string}
              onChoose={() => onChoose(choice)}
              filtered={false}
            />
          ))}
    </div>
  );
}

export namespace Results {
  export const pageSize = () => 4;
}

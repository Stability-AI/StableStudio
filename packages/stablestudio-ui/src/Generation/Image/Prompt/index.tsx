import { Generation } from "~/Generation";
import { Theme } from "~/Theme";
import { Input } from "~/Theme/Input";

import { Examples } from "./Examples";

import { Random } from "./Random";
import { Reuse } from "./Reuse";
import { Sidebar } from "./Sidebar";

export * from "./Prompts";

export type Prompt = {
  text?: string;
  weight: number;
};

type Props = StyleableWithChildren & {
  id: ID;
  index?: number;
  advanced?: boolean;
  readOnly?: boolean;
  variant?: "simple" | "advanced" | "display";
  allowUseAgain?: boolean;
};

export function Prompt({
  id,
  index = 0,
  variant = "simple",
  allowUseAgain,
  className,
}: Props) {
  const { deletePrompt, shuffle, setInput, input } =
    Generation.Image.Input.use(id);

  const promptText = input?.prompts[index]?.text;
  const promptWeight = input?.prompts[index]?.weight ?? 1;
  const isRandomPrompt = useMemo(
    () => Generation.Image.Prompt.Random.is(promptText),
    [promptText]
  );
  const [expanded, setExpanded] = useState(promptWeight >= 0);

  const onChange = useCallback(
    (prompt: string) =>
      setInput((input) => {
        (input.prompts[index] as Prompt).text = prompt;
      }),
    [setInput, index]
  );

  const onFocus = useCallback(
    (event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const end = event.target.value.length;
      event.target.setSelectionRange(isRandomPrompt ? 0 : end, end);
    },
    [isRandomPrompt]
  );

  const shufflePrompt = useMemo(
    () => (
      <Theme.Tooltip content="Shuffle prompt" delay={500}>
        <Theme.Button
          transparent
          icon={Theme.Icon.Dices}
          onClick={() => shuffle(index)}
          className={classes(input?.prompts.length === 1 && "-mr-1", "p-0")}
        />
      </Theme.Tooltip>
    ),
    [shuffle, index, input?.prompts.length]
  );

  const prompt =
    variant === "display" ? (
      <div className="flex flex-row items-center gap-3 truncate">
        <p className="w-full truncate text-base">{promptText}</p>
        {input?.id && allowUseAgain && <Reuse.Button inputID={input?.id} />}
      </div>
    ) : (
      <div className="flex flex-row">
        <Input
          key={keys(id, index)}
          transparent
          autoSize
          className="w-full px-0 py-0"
          placeholder={
            promptWeight > 0
              ? "What do you want to see?"
              : "What do you want to avoid?"
          }
          value={promptText}
          onChange={onChange}
          onFocus={onFocus}
        />
      </div>
    );

  const controls = useMemo(() => {
    const removeIcon = (
      <Theme.Button
        transparent
        icon={Theme.Icon.Trash}
        onClick={() => deletePrompt(index)}
        className="p-0 hover:text-red-500"
      />
    );

    return (
      <div className="flex flex-row items-center">
        {input?.prompts.length === 1 ? (
          <>{promptWeight >= 0 && shufflePrompt}</>
        ) : (
          <>
            {promptWeight >= 0 && shufflePrompt}
            {variant === "advanced" && index > 1 && removeIcon}
          </>
        )}
      </div>
    );
  }, [
    input?.prompts.length,
    promptWeight,
    shufflePrompt,
    variant,
    deletePrompt,
    index,
  ]);

  if (!input) return null;
  return variant === "display" ? (
    <div
      className={classes(
        "flex items-center justify-between gap-2 text-lg",
        className
      )}
    >
      {prompt}
    </div>
  ) : (
    <div
      className={classes(
        "group flex w-full gap-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800",
        className
      )}
    >
      <div className="flex w-full flex-col gap-2">
        {input.prompts.length > 1 && (
          <div className="flex select-none flex-row items-center">
            <Theme.Button
              className="mr-auto p-0"
              transparent
              onClick={() => setExpanded(!expanded)}
              icon={(props) => (
                <Theme.Icon.ChevronRight
                  {...props}
                  className={classes(
                    props.className,
                    promptWeight >= 0 ? "text-green-500" : "text-red-500",
                    expanded && "rotate-90",
                    "p-0"
                  )}
                />
              )}
            >
              <h1 className="w-full font-normal text-slate-800 dark:text-white">
                {(input.prompts[index]?.weight ?? 0) > 0
                  ? input.prompts.filter((p: Prompt) => p.weight > 0).length ===
                    1
                    ? "Prompt"
                    : `Prompt ${index + 1}`
                  : "Negative prompt"}
              </h1>
            </Theme.Button>
            <div className="pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100">
              {controls}
            </div>
          </div>
        )}
        {expanded && prompt}
        {/* {variant === "advanced" && input.prompts.length > 1 && (
          <Theme.Slider
            key={index}
            percentage
            title="Weight"
            min={-100}
            step={1}
            max={100}
            value={input.prompts[index].weight * 100}
            onChange={(value) =>
              setInput((input) => {
                input.prompts[index].weight = value / 100;
              })
            }
          />
        )} */}
      </div>
    </div>
  );
}

export declare namespace Prompt {
  export { Random, Reuse, Sidebar, Examples };
}

export namespace Prompt {
  Prompt.Random = Random;
  Prompt.Reuse = Reuse;
  Prompt.Sidebar = Sidebar;
  Prompt.Examples = Examples;
}

import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

import { Filter } from "./Filter";

export function SpecialEffects({
  showing,
  loading,
  variant,
  example,
  onClick,
  input,
}: {
  showing?: boolean;
  loading?: boolean;
  variant?: "editor" | "small";
  example?: {
    src: string;
    prompt: string;
  };
  onClick?: () => void;
  input?: ID;
  border?: boolean;
}) {
  if (!showing) return null;
  return (
    <div
      className={classes(
        "pointer-events-none absolute flex h-full w-full items-center justify-center rounded-md border border-zinc-300 opacity-0 duration-150 dark:border-zinc-700",
        (variant !== "editor" || loading) && "bg-zinc-900/50",
        (variant === "editor" || showing) && "opacity-100"
      )}
    >
      {variant === "editor" && <Theme.Checkered className="-z-[1] bg-fixed" />}
      {example && (
        <>
          <img
            className={classes(
              "absolute h-full w-full object-cover opacity-25 duration-150",
              loading && "opacity-0"
            )}
            src={example.src}
          />
          <div
            className={classes(
              "absolute bottom-0 left-0 right-0 truncate whitespace-nowrap p-3 italic text-white opacity-75 duration-150",
              loading && "opacity-0"
            )}
          >
            {example.prompt}
          </div>
        </>
      )}
      {variant !== "editor" && (
        <div className="absolute flex h-full w-full items-center justify-center">
          {onClick && example && !loading && input ? (
            <Generation.Image.Create.Button
              id={input}
              icon={Theme.Icon.Dream}
              onIdleClick={onClick}
              className="pointer-events-auto"
            >
              Try template
            </Generation.Image.Create.Button>
          ) : (
            <Theme.Logo
              className={classes(
                "absolute h-12 w-12 opacity-50 duration-150",
                loading && "opacity-0",
                variant === "small" && "h-8 w-8"
              )}
            />
          )}
        </div>
      )}
      <div className="absolute flex h-full w-full items-center justify-center">
        {loading && (
          <Theme.Loading.Spinner
            className={classes(
              variant === "small" ? "h-1/2 w-1/2" : "h-10 w-10"
            )}
          />
        )}
      </div>
    </div>
  );
}

export declare namespace SpecialEffects {
  export { Filter };
}

export namespace SpecialEffects {
  SpecialEffects.Filter = Filter;
}

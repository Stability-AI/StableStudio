import { CircularProgressbar } from "react-circular-progressbar";
import { Generation } from "~/Generation";
import { Theme } from "~/Theme";
import "react-circular-progressbar/dist/styles.css";

import { Filter } from "./Filter";

export function SpecialEffects({
  showing,
  loading,
  variant,
  example,
  onClick,
  input,
  output,
  progress,
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
  output?: ID;
  border?: boolean;
  progress?: number;
}) {
  if (!showing) return null;
  const [starting] = useState(
    output ? Generation.Image.Output.get(output).requestedAt : undefined
  );
  const [eta, setETA] = useState<number | undefined>();

  useEffect(() => {
    if (!loading) return;
    if (typeof progress !== "number") return;
    if (!starting) return;

    const seconds = (Date.now() - starting.getTime()) / 1000;
    const eta = seconds / progress - seconds;
    setETA(eta);
  }, [loading, progress, starting]);

  return (
    <div
      className={classes(
        "pointer-events-none absolute flex h-full w-full items-center justify-center rounded-md border border-zinc-700 opacity-0 duration-150",
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
        {loading &&
          (typeof progress === "number" ? (
            <div className="relative flex flex-col items-center justify-center gap-1">
              <div
                className={classes(
                  variant === "small" ? "h-1/2 w-1/2" : "h-10 w-10"
                )}
              >
                <CircularProgressbar
                  value={progress}
                  maxValue={1}
                  styles={{
                    // Customize the path, i.e. the "completed progress"
                    path: {
                      // Path color
                      stroke: "#ffffff",
                      // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                      strokeLinecap: "butt",
                      // Customize transition animation
                      transition: "stroke-dashoffset 0.5s ease 0s",
                      transformOrigin: "center center",
                      strokeWidth: 8,
                    },
                    // Customize the circle behind the path, i.e. the "total progress"
                    trail: {
                      // Trail color
                      stroke: "#4c4c4d",
                      // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                      strokeLinecap: "butt",
                      transformOrigin: "center center",
                      strokeWidth: 8,
                    },
                  }}
                />
              </div>
              <p className="absolute top-full mt-1">
                {(eta ?? 0) > 0 && (
                  <span className="text-sm text-white">
                    {Math.round(eta ?? 0)}s
                  </span>
                )}
              </p>
            </div>
          ) : (
            <Theme.Loading.Spinner
              className={classes(
                variant === "small" ? "h-1/2 w-1/2" : "h-10 w-10"
              )}
            />
          ))}
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

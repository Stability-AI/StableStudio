import * as ReactQuery from "@tanstack/react-query";

import { Generation } from "~/Generation";
import { Size } from "~/Geometry";
import { Plugin } from "~/Plugin";
import { Theme } from "~/Theme";

export type Ratio = Size & { label?: string };

export function Ratio({
  id,
  fullControl,
  toggleFullControl,
}: {
  id?: ID;
  advanced?: boolean;
  fullControl?: boolean;
  toggleFullControl?: () => void;
}) {
  const { input } = Generation.Image.Input.use(id);
  const { closest, ratios } = Ratios.use(id, fullControl);
  const [timer, setTimer] = React.useState<NodeJS.Timeout | null>(null);
  const [forceTooltipOpen, setForceTooltipOpen] = React.useState(false);

  const onChange = useCallback(
    (index: number) => {
      if (timer) clearTimeout(timer);
      if (id) {
        Generation.Image.Input.set(id, (input) => {
          const width = ratios[index]?.input.width;
          const height = ratios[index]?.input.height;

          if (width) input.width = width;
          if (height) input.height = height;
        });
      }
      setTimer(
        setTimeout(() => {
          setTimer(null);
          setForceTooltipOpen(false);
        }, 500)
      );
      setForceTooltipOpen(true);
    },
    [id, ratios, timer]
  );

  useEffect(() => {
    onChange(closest?.index ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input?.model]);

  if (!closest || ratios.length <= 1) return null;
  return (
    <>
      <div
        className="flex shrink flex-row items-center justify-between"
        onDoubleClick={toggleFullControl}
      >
        <div className="flex w-1/3 items-center justify-start">
          <Theme.Icon.Rectangle className="opacity-muted-extra w-[28px]" />
        </div>
        <Theme.Tooltip
          delay={500}
          content={`${input?.width} × ${input?.height}`}
          forceOpen={forceTooltipOpen}
        >
          <h1 className="select-none">
            {closest.width}
            <span className="opacity-muted"> : </span>
            {closest.height}
          </h1>
        </Theme.Tooltip>
        <div className="flex w-1/3 items-center justify-end">
          <Theme.Icon.Rectangle className="opacity-muted-extra w-[28px] rotate-90" />
        </div>
      </div>
      <Theme.Slider
        noFill
        max={Math.max(2, ratios.length - 1)}
        value={ratios.length === 1 ? 1 : closest.index}
        onChange={onChange}
        disabled={ratios.length === 1}
        className={classes(ratios.length === 1 && "opacity-20")}
      />
    </>
  );
}

export namespace Ratio {
  export const toSize = ({
    ratio,
    bounds,
    area,
  }: {
    ratio: Ratio;
    bounds: Generation.Image.Size.Bounds;
    area?: number;
  }) => {
    if (!area) {
      const aspect = ratio.width / ratio.height;
      const min = bounds.length.min;
      const width = aspect >= 1 ? Math.max(min, Math.round(min * aspect)) : min;
      const height = aspect < 1 ? Math.max(min, Math.round(min / aspect)) : min;
      return { width, height };
    }

    const width = Math.sqrt(area);
    const height = Math.sqrt(area);

    const scaleAndRound = (scale: number) => ({
      width: clamp(
        bounds.length.min,
        Math.round(width * scale),
        bounds.length.max
      ),

      height: clamp(
        bounds.length.min,
        Math.round(height * scale),
        bounds.length.max
      ),

      actual: (width * scale) / (height * scale),
    });

    if (width < bounds.length.min && height < bounds.length.min)
      return scaleAndRound(
        Math.min(bounds.length.min / width, bounds.length.min / height)
      );

    if (width < bounds.length.min)
      return scaleAndRound(bounds.length.min / width);

    if (height < bounds.length.min)
      return scaleAndRound(bounds.length.min / height);

    return scaleAndRound(1);
  };
}

export type Ratios = Ratio[];
export namespace Ratios {
  const presets = [
    { width: 1, height: 1 },
    { width: 4, height: 3 },
    { width: 3, height: 2 },
    { width: 4, height: 5 },
    { width: 16, height: 9 },
    { width: 1.85, height: 1 },
    { width: 7, height: 4 },
    { width: 2, height: 1 },
    { width: 3, height: 1 },
    { width: 4, height: 1 },
  ] as const;

  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const simplifyAspectRatio = (width: number, height: number) => {
    const divisor = gcd(width, height);
    return { width: width / divisor, height: height / divisor } as Ratio;
  };

  export const usePluginResolutions = (model?: ID) => {
    const getStableDiffusionAllowedResolutions = Plugin.use(
      ({ getStableDiffusionAllowedResolutions }) =>
        getStableDiffusionAllowedResolutions
    );

    return ReactQuery.useQuery({
      enabled: !!getStableDiffusionAllowedResolutions,

      queryKey: ["Generation.Image.Ratio.PluginResolutions.use"],
      queryFn: async () =>
        (await getStableDiffusionAllowedResolutions?.(model)) ?? [],
    });
  };

  export const use = (id?: ID, fullControl = false) => {
    const { input } = Generation.Image.Input.use(id);
    const { data: pluginResolutions } = usePluginResolutions(input?.model);
    const bounds = Generation.Image.Size.Bounds.use(id);
    const ratios = useMemo(() => {
      if (!input?.width || !input?.height || !bounds) return [];

      const sizing = (ratio: Ratio) => {
        return {
          ...ratio,
          input: Ratio.toSize({
            ratio,
            bounds,
            ...(fullControl && { area: input.width * input.height }),
          }),
        };
      };

      const ratios = pluginResolutions
        ? pluginResolutions.map(({ width, height }) => ({
            ...simplifyAspectRatio(width, height),
            input: {
              width,
              height,
            },
          }))
        : (fullControl ? presets : presets.slice(0, -2))
            .map(sizing)
            .filter(
              ({ input }) => input.width * input.height <= bounds.area.max
            );

      const flipped = ratios.map(({ width, height, input }) => ({
        width: height,
        height: width,
        input: {
          width: input.height,
          height: input.width,
        },
      }));

      return [...ratios, ...flipped.slice(1)].sort(
        (a, b) => b.width / b.height - a.width / a.height
      );
    }, [fullControl, bounds, input?.width, input?.height]);

    type Closest = Ratio & {
      index: number;
      difference: number;
    };

    const closest = useMemo(() => {
      if (!input?.width || !input?.height || !ratios[0]) return;

      const actual = input.width / input.height;
      return ratios.reduce<Closest>(
        (closest, ratio, index) => {
          const difference = Math.abs(actual - ratio.width / ratio.height);
          return difference < closest.difference
            ? { ...ratio, index, difference }
            : closest;
        },
        { index: 0, difference: Infinity, ...ratios[0] }
      );
    }, [ratios, input?.width, input?.height]);

    return { closest, ratios };
  };
}

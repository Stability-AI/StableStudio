import { keyframes } from "@emotion/react";

import { SVG } from "./SVG";

export function Stars({
  showing = true,
  twinkling = false,
  count = 20,
  className,
}: Stars.Props) {
  const [offset] = useState(() => Math.random() * 1000);

  const starsFast = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => (
        <Star key={index} index={index} offset={offset} count={count} fast />
      )),
    [offset, count]
  );

  const starsSlow = useMemo(
    () =>
      Array.from({ length: Math.ceil(count / 2) }, (_, index) => (
        <Star key={index} index={index} offset={offset} count={count} />
      )),
    [offset, count]
  );

  return !showing ? null : (
    <div
      className={classes(
        "pointer-events-none absolute h-full w-full opacity-0 duration-150",
        showing && "opacity-100",
        className
      )}
    >
      <div
        className={classes(
          "absolute h-full w-full opacity-0 duration-500",
          twinkling && "opacity-100"
        )}
      >
        {starsFast}
      </div>
      <div
        className={classes(
          "absolute h-full w-full opacity-100 duration-500",
          twinkling && "opacity-0"
        )}
      >
        {starsSlow}
      </div>
    </div>
  );
}

function Star({
  index,
  offset,
  count,
  fast,
}: {
  index: number;
  offset: number;
  count: number;
  fast?: boolean;
}) {
  return useMemo(() => {
    const top = clamp(10, (offset + (index / count) * 13543.34) % 100, 90);
    const left = clamp(10, (offset + (index / count) * 16857.24) % 100, 90);

    const scale = Math.max(1, (index / count) * 2);
    const angle = (offset + (index / count) * 13543.34) % 360;

    return (
      <div
        className="absolute h-0 w-0 text-white"
        css={css`
          animation-name: ${spin};
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        `}
        style={{
          animationDelay: `${-offset + index * 3.4}s`,
          animationDuration: fast ? "7s" : "30s",
          top: `${top}%`,
          left: `${left}%`,
        }}
      >
        <SVG
          css={css`
            animation-name: ${twinkle};
            animation-iteration-count: infinite;
            animation-timing-function: ease-in-out;
            animation-direction: alternate;
          `}
          style={{
            animationDelay: `${-offset + index * 3.4}s`,
            animationDuration: fast ? "2s" : "30s",
            transform: `translate(-50%, -50%) scale(${scale}) rotate(${angle}deg)`,
          }}
        />
      </div>
    );
  }, [index, offset, count, fast]);
}

export namespace Stars {
  export type Props = Styleable & {
    showing?: boolean;
    twinkling?: boolean;
    count?: number;
  };
}

const twinkle = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const spin = keyframes`
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
`;

import { keyframes } from "@emotion/react";

export function Rainbow({
  showing = true,
  variant = "spiral",
  className,
}: Styleable & {
  showing?: boolean;
  variant?: "linear" | "spiral";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.animationName = "none";
    ref.current.style.animationName = growShrink.name;
  }, [ref, showing]);

  const offset = useMemo(() => Math.random() * 10, []);
  return (
    <div
      className={classes(
        "duration-1500 absolute top-0 left-0 right-0 bottom-0 overflow-hidden opacity-20 blur-2xl",
        !showing && "opacity-0",
        className
      )}
    >
      {variant === "linear" ? (
        <div />
      ) : (
        <div
          ref={ref}
          className="h-full w-full"
          css={css`
            animation-name: ${growShrink};
            animation-duration: 7s;
            animation-iteration-count: infinite;
            animation-timing-function: ease-in-out;
            animation-direction: alternate;
          `}
        >
          <div
            className="h-full w-full"
            css={css`
              background-image: url("/RainbowSpiral.jpg");
              background-size: cover;
              background-repeat: repeat;
              background-position: center;

              animation-name: ${spin};
              animation-duration: 3s;
              animation-iteration-count: infinite;
              animation-timing-function: linear;
            `}
            style={{
              animationDelay: `-${offset}s`,
            }}
          />
        </div>
      )}
    </div>
  );
}

const spin = keyframes`
  0% {
    transform: scale(${Math.sqrt(2)}) rotate(0deg);
  }

  100% {
    transform: scale(${Math.sqrt(2)}) rotate(360deg);
  }
`;

const growShrink = keyframes`
  0% {
    transform: scale(7);
  }

  100% {
    transform: scale(3);
  }
`;

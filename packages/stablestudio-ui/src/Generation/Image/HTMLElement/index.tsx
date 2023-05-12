import { Generation } from "~/Generation";

import { Dragging } from "./Dragging";

export function HTMLElement({
  image,
  src,

  onLoadingChange,
  onClick,

  className,
}: Styleable & {
  image?: Generation.Image;
  src?: URLString;

  onLoadingChange?: (loading: boolean) => void;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLImageElement | null>(null);

  const startDragging = Dragging.useStart();
  const stopDragging = Dragging.useStop();

  const [loading, setLoading] = useState(true);
  const actualSRC = src ?? image?.src;

  useEffect(() => {
    !ref.current?.complete && setLoading(true);
  }, [actualSRC]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  if (!actualSRC) return null;
  return (
    <img
      src={actualSRC}
      onDragStart={() => startDragging(image)}
      onDragEnd={() => stopDragging(image)}
      onClick={onClick}
      ref={(img) => {
        ref.current = img;

        if (!img) return;
        img.onload = () => setLoading(false);
      }}
      className={classes(
        "h-full w-full object-cover opacity-0 duration-500",
        !loading && "opacity-100",
        className
      )}
    />
  );
}

HTMLElement.Dragging = Dragging;

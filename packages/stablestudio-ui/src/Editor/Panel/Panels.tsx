import { Editor } from "~/Editor";
import { GlobalState } from "~/GlobalState";

export function Panels({
  fixed = false,
  left,
  right,
  children,
  className,
}: StyleableWithChildren & {
  fixed?: boolean;
  left?: boolean;
  right?: boolean;
}) {
  return (
    <div
      className={classes(
        "pointer-events-none absolute bottom-2 flex flex-col justify-between gap-2",
        fixed ? "top-0" : "top-2",
        !fixed && left && "left-2",
        fixed && "left-12",
        right && "right-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export namespace Panels {
  const useState = GlobalState.create(() => ({
    topLeft: false,
    topRight: false,
    bottomLeft: false,
    bottomRight: false,
  }));

  export const useExpanded = (position: Editor.Panel.Position) => {
    const state = useState();
    const setState = useState.setState;

    const expanded = useMemo(() => state[position], [state, position]);
    const setExpanded = useCallback(
      (setExpanded?: React.SetStateAction<boolean>) =>
        setState({
          [position]:
            setExpanded === undefined
              ? !expanded
              : typeof setExpanded === "function"
              ? setExpanded(expanded)
              : setExpanded,
        }),
      [position, expanded, setState]
    );

    return [expanded, setExpanded] as const;
  };
}

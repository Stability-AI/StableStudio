import { Editor } from "~/Editor";
import { GlobalState } from "~/GlobalState";
import { Theme } from "~/Theme";

import { Shortcuts } from "./Shortcut";

export type Selection = Set<string>;

export declare namespace Selection {
  export { Shortcuts };
}

export namespace Selection {
  Selection.Shortcuts = Shortcuts;

  const useState = GlobalState.create(() => ({
    selection: new Set<string>(),
  }));

  export const use = () => useState(({ selection }) => selection);
  export const useSelect = () => {
    const setState = useState.setState;
    return useCallback(
      (first: ID | ID[], ...rest: ID[]) => {
        const ids = [...(typeof first === "string" ? [first] : first), ...rest];
        return setState({ selection: new Set(ids) });
      },
      [setState]
    );
  };

  export const useSelected = (id: ID) => {
    const selection = use();
    return useMemo(() => selection.has(id), [id, selection]);
  };

  export const useClear = () => {
    const setState = useState.setState;
    return useCallback(() => setState({ selection: new Set() }), [setState]);
  };

  export type OnlyOne = ID | undefined;
  export namespace OnlyOne {
    export const use = (id?: ID) => {
      const selection = useState(({ selection }) => selection);
      return useMemo(() => {
        if (selection.size !== 1 || (id && !selection.has(id))) return;
        return id ?? [...selection][0];
      }, [id, selection]);
    };

    export const useSet = (id: ID) => {
      const setState = useState.setState;
      return useCallback(
        (setSelected: React.SetStateAction<boolean>) => {
          setState(({ selection: previousSelection }) => {
            const selection = new Set(previousSelection);
            const isCurrentlySelected = selection.has(id);
            const shouldBeSelected =
              typeof setSelected === "function"
                ? setSelected(isCurrentlySelected)
                : setSelected;

            shouldBeSelected ? selection.add(id) : selection.delete(id);
            return { selection };
          });
        },
        [id, setState]
      );
    };
  }

  export function Tool() {
    return (
      <Editor.Tool label="Select" tool="select">
        <Icon strokeWidth={1.5} size={22} />
      </Editor.Tool>
    );
  }

  export function Icon(props: React.ComponentProps<typeof Theme.Icon.Select>) {
    return <Theme.Icon.Select {...props} />;
  }
}

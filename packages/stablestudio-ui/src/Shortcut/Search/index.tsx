import MiniSearch from "minisearch";
import { useDebounce } from "react-use";

import { GlobalState } from "~/GlobalState";
import { Shortcut } from "~/Shortcut";

export namespace Search {
  export const use = () => {
    const {
      text,
      setText: setTextRaw,
      miniSearch,
      lastAdded,
    } = State.use(({ text, setText, miniSearch, lastAdded }) => ({
      text,
      setText,
      miniSearch,
      lastAdded,
    }));

    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState([] as ID[]);

    const setText = useCallback(
      (text = "") => {
        setTextRaw(text);
        setLoading(text !== "");
        setMatches([]);
      },
      [setTextRaw]
    );

    const clear = useCallback(() => setText(""), [setText]);

    useDebounce(() => setLoading(false), 500, [matches]);
    useDebounce(
      () => setMatches(miniSearch.search(text).map(({ id }) => id)),
      10,
      [text, miniSearch, lastAdded]
    );

    return useMemo(
      () => ({ loading, matches, text, setText, clear }),
      [matches, loading, text, setText, clear]
    );
  };

  export type Data = Datum[];
  export type Datum = { id: ID; text: string };
  export namespace Datum {
    export const use = (shortcut: Shortcut) => {
      const { enabled, id } = shortcut;

      const text = useMemo(() => Shortcut.Name.toString(shortcut), [shortcut]);

      const { miniSearch, setLastAdded } = State.use(
        ({ miniSearch, setLastAdded }) => ({
          miniSearch,
          setLastAdded,
        })
      );

      useEffect(() => {
        const remove = () => {
          miniSearch.has(id) && miniSearch.remove({ id, text });
        };

        remove();
        miniSearch.add({ id, text });
        setLastAdded(id);

        return remove;
      }, [enabled, id, text, miniSearch, setLastAdded]);
    };
  }
}

type State = {
  text: string;
  setText: (text: string) => void;

  miniSearch: MiniSearch<Search.Datum>;

  lastAdded?: ID;
  setLastAdded: (lastAdded: ID) => void;
};

namespace State {
  export const use = GlobalState.create<State>((set) => ({
    text: "",
    setText: (text) => set({ text }),

    miniSearch: new MiniSearch({
      idField: "id",
      fields: ["text"],
      storeFields: [],
      searchOptions: {
        fuzzy: true,
        prefix: true,
      },
    }),

    lastAdded: undefined,
    setLastAdded: (lastAdded: ID) => set({ lastAdded }),
  }));
}

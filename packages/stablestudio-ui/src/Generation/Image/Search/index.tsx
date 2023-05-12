import MiniSearch from "minisearch";
import { useDebounce } from "react-use";

import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";

export namespace Search {
  export const use = () => {
    const { miniSearch, lastAdded } = State.use(
      ({ miniSearch, lastAdded }) => ({
        miniSearch,
        lastAdded,
      })
    );

    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState([] as ID[]);
    const [text, setTextRaw] = useState(undefined as string | undefined);

    useEffect(() => setLoading(!!text), [text]);

    const setText = useCallback(
      (value?: string) => {
        const text = value === undefined || value === "" ? undefined : value;

        setTextRaw(text);
        setLoading(!!text);
        setMatches([]);
      },
      [setTextRaw]
    );

    const clear = useCallback(() => setText(), [setText]);

    useDebounce(
      () => {
        if (!text) return setMatches([]);

        setMatches(miniSearch.search(text).map(({ id }) => id));
        setLoading(false);
      },
      250,
      [text, miniSearch, lastAdded]
    );

    return useMemo(
      () => ({ loading, matches, text, setText, clear }),
      [matches, loading, text, setText, clear]
    );
  };

  export const useMakeSearchable = () => {
    const [inputs] = Generation.Image.Inputs.use();

    const { miniSearch, setLastAdded } = State.use(
      ({ miniSearch, setLastAdded }) => ({
        miniSearch,
        setLastAdded,
      })
    );

    return useCallback(
      (...images: Generation.Images) => {
        const imagesToAdd = images.reduce((images, image) => {
          if (!image.id) return images;

          const prompt = inputs[image.inputID]?.prompts
            .map(({ text }) => text)
            .join(" ");

          if (!prompt) return images;

          return [...images, { id: image.id, prompt }];
        }, [] as Data);

        if (!imagesToAdd.length) return;

        imagesToAdd.forEach(({ id, prompt }) => {
          miniSearch.has(id) && miniSearch.remove({ id, prompt });
          miniSearch.add({ id, prompt });
        });

        const lastAdded = imagesToAdd[imagesToAdd.length - 1]?.id;
        lastAdded && setLastAdded(lastAdded);
      },
      [inputs, miniSearch, setLastAdded]
    );
  };
}

type State = {
  miniSearch: MiniSearch<Datum>;

  lastAdded?: ID;
  setLastAdded: (lastAdded: ID) => void;
};

type Data = Datum[];
type Datum = { id: ID; prompt: string };

namespace State {
  export const use = GlobalState.create<State>((set) => ({
    miniSearch: new MiniSearch({
      idField: "id",
      fields: ["prompt"],
      storeFields: [],
    }),

    lastAdded: undefined,
    setLastAdded: (lastAdded: ID) => set({ lastAdded }),
  }));
}

import { GlobalState } from "~/GlobalState";
import { Theme } from "~/Theme";
import { Plugin } from "~/Plugin";

export type Count = number;
export namespace Count {
  export function Slider() {
    const [count, setCount] = Count.use();
    return (
      <Theme.Slider
        title="Image count"
        min={1}
        max={10}
        value={count}
        onChange={setCount}
      />
    );
  }
}

export namespace Count {
  const {getStableDiffusionDefaultCount} = Plugin.get();
  export const preset = () => getStableDiffusionDefaultCount?.() ?? 4;

  export const get = (): number => store.getState().count;
  export const set = (count: number) => store.getState().setCount(count);
  export const use = () =>
    store(
      ({ count, setCount }) => [count, setCount] as const,
      GlobalState.shallow
    );
}

const store = GlobalState.create<{
  count: number;
  setCount: (count: number) => void;
}>((set) => ({
  count: Count.preset(),
  setCount: (count) => set({ count }),
}));

import Konva from "konva";
import { useDebounce, useWindowSize } from "react-use";

import { Editor } from "~/Editor";
import { GlobalState } from "~/GlobalState";

export namespace Setup {
  const useGlobalState = GlobalState.create<{
    id?: ID;
    canvas: React.RefObject<Konva.Stage>;
    loading: boolean;
    zoom: number;
  }>(() => ({
    canvas: React.createRef(),
    loading: true,
    zoom: 1,
  }));

  export const useCanvas = () => useGlobalState(({ canvas }) => canvas);

  export const use = () => {
    useAutomaticResize();

    const resize = Editor.Canvas.useResize();
    const resetEditor = Editor.Reset.use();

    const state = useGlobalState();
    const setState = useGlobalState.setState;

    const [id] = useState(ID.create());

    useEffect(() => {
      if (id === state.id) return;
      setState({ id, loading: true });
    }, [id, state.id, setState]);

    useEffect(() => {
      if (!state.loading || !state.id || !state.canvas.current) return;

      resize();
      resetEditor();
      setState({ loading: false });
    }, [state.loading, state.id, state.canvas, setState, resize, resetEditor]);

    return state;
  };

  const useAutomaticResize = () => {
    const { height, width } = useWindowSize();
    const resize = Editor.Canvas.useResize();
    useDebounce(resize, 1000, [width, height, resize]);
  };

  export const setZoom = (zoom: number) => {
    useGlobalState.setState({ zoom });
  };

  export const useZoom = () => {
    const { zoom } = useGlobalState(({ zoom }) => ({ zoom }));
    return zoom;
  };
}

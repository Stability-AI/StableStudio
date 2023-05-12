import { Editor } from "~/Editor";
import { Shortcut as Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export namespace Zoom {
  export function Tools() {
    return (
      <>
        <In.Tool />
        <Out.Tool />
      </>
    );
  }

  export namespace Shortcuts {
    export const use = () => {
      In.Shortcuts.use();
      Out.Shortcuts.use();
      Reset.Shortcuts.use();
    };
  }

  export namespace In {
    export const use = () => {
      const canvasRef = Editor.Canvas.use();
      return useCallback(() => {
        if (!canvasRef?.current) return;
        Editor.Canvas.changeZoom(1.1, canvasRef.current);
      }, [canvasRef]);
    };

    export function Tool() {
      const zoomIn = use();
      return (
        <Editor.Tool onClick={zoomIn}>
          <Theme.Icon.ZoomIn />
        </Editor.Tool>
      );
    }

    export namespace Shortcuts {
      export const use = () => {
        const zoomIn = In.use();
        Shortcut.use(
          useMemo(
            () => ({
              name: ["Camera", "Zoom", "In"],
              icon: Theme.Icon.ZoomIn,

              keys: ["Meta", "="],
              action: zoomIn,
            }),
            [zoomIn]
          )
        );
      };
    }
  }

  export namespace Out {
    export const use = () => {
      const canvasRef = Editor.Canvas.use();
      return useCallback(() => {
        if (!canvasRef?.current) return;
        Editor.Canvas.changeZoom(0.9, canvasRef.current);
      }, [canvasRef]);
    };

    export function Tool() {
      const zoomOut = use();
      return (
        <Editor.Tool onClick={zoomOut}>
          <Theme.Icon.ZoomOut />
        </Editor.Tool>
      );
    }

    export namespace Shortcuts {
      export const use = () => {
        const zoomOut = Out.use();
        Shortcut.use(
          useMemo(
            () => ({
              name: ["Camera", "Zoom", "Out"],
              icon: Theme.Icon.ZoomIn,

              keys: ["Meta", "-"],
              action: zoomOut,
            }),
            [zoomOut]
          )
        );
      };
    }
  }

  export namespace Reset {
    export const use = () => {
      const canvasRef = Editor.Canvas.use();
      return useCallback(() => {
        if (!canvasRef?.current) return;
        Editor.Canvas.changeZoom(undefined, canvasRef.current);
      }, [canvasRef]);
    };

    export namespace Shortcuts {
      export const use = () => {
        const resetZoom = Reset.use();
        Shortcut.use(
          useMemo(
            () => ({
              name: ["Camera", "Zoom", "Reset"],
              icon: Theme.Icon.Search,

              keys: ["Meta", "0"],
              action: resetZoom,
            }),
            [resetZoom]
          )
        );
      };
    }
  }
}

import { Editor } from "~/Editor";
import { Generation } from "~/Generation";

export function Box({ id, showHandles }: { id: ID; showHandles?: boolean }) {
  const { input } = Generation.Image.Input.use(id);
  const selected = Editor.Selection.useSelected(id);
  const [dream] = Editor.Entity.use<Editor.Dream>(id);
  const loading = Generation.Image.Output.useIsGenerating(
    dream ? dream?.outputID : undefined
  );

  if (!input) return null;
  return (
    <>
      <div className={classes("pointer-events-none relative h-full w-full")}>
        <Generation.Image.SpecialEffects
          showing
          variant="editor"
          loading={loading}
          border={selected}
        />
        {!selected && (
          <div className="h-full w-full border-[2px] border-dashed border-white/50" />
        )}
        <div
          className={classes(
            "relative h-full w-full opacity-0 duration-150",
            selected && !loading && "opacity-100"
          )}
        >
          {selected && showHandles && !input.model.includes("xl") && (
            <>
              <Handle className="top-0 left-0" />
              <Handle className="top-0 left-1/2" />
              <Handle className="top-0 left-full" />
              <Handle className="top-1/2 left-0" />
              <Handle className="top-1/2 left-full" />
              <Handle className="top-full left-0" />
              <Handle className="top-full left-1/2" />
              <Handle className="top-full left-full" />
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Handle({ className }: Styleable) {
  const size = Editor.Entity.Handle.size();
  return (
    <div
      style={{ width: size, height: size }}
      className={classes(
        "absolute z-[10] -translate-x-1/2 -translate-y-1/2 bg-white drop-shadow",
        className
      )}
    />
  );
}

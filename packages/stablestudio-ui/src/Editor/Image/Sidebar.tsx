import { App } from "~/App";
import { Editor } from "~/Editor";
import { Theme } from "~/Theme";

export namespace Sidebar {
  export function Tab({ id }: { id: ID }) {
    const [entity, setEntity] = Editor.Entity.use<Editor.Image>(id);
    if (!entity) return null;
    return (
      <>
        <App.Sidebar.Section
          divider
          collapsable
          defaultExpanded
          title="Transform"
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-8">
              <Theme.NumberInput
                icon="X"
                fullWidth
                number
                round
                step={1}
                value={entity?.x}
                onNumberChange={(x) =>
                  setEntity((entity) => ({ ...entity, x }))
                }
              />
              <Theme.NumberInput
                icon="Y"
                fullWidth
                number
                round
                step={1}
                value={entity?.y}
                onNumberChange={(y) =>
                  setEntity((entity) => ({ ...entity, y }))
                }
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-8">
                <Theme.NumberInput
                  icon="W"
                  fullWidth
                  number
                  round
                  step={1}
                  value={entity?.width}
                  onNumberChange={(w) =>
                    setEntity((entity) => ({ ...entity, width: w }))
                  }
                />
                <Theme.NumberInput
                  icon="H"
                  fullWidth
                  number
                  round
                  step={1}
                  value={entity?.height}
                  onNumberChange={(h) =>
                    setEntity((entity) => ({ ...entity, height: h }))
                  }
                />
              </div>
            </div>
          </div>
        </App.Sidebar.Section>
      </>
    );
  }
}

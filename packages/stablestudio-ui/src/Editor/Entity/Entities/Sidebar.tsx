import { App } from "~/App";
import { Editor } from "~/Editor";
import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export namespace Sidebar {
  export function Section() {
    const entities = Editor.Entities.use();
    const createDream = Editor.Dream.Create.use();
    const deleteEntities = Editor.Entities.useDelete();
    const selected = Editor.Selection.use();
    const openFiles = Editor.Image.Import.useOpenFiles();

    const { dreams, images, selectedDreams, selectedImages } = useMemo(() => {
      const dreams = entities.filter((e) => e.type === "dream");
      const images = entities.filter((e) => e.type === "image");
      const selectedDreams = dreams.filter((d) => selected.has(d.id));
      const selectedImages = images.filter((i) => selected.has(i.id));
      return { dreams, images, selectedDreams, selectedImages };
    }, [entities, selected]);

    return (
      <>
        <App.Sidebar.Section collapsable divider defaultExpanded padding="none">
          <div className="flex border-b border-zinc-800 py-2 pl-1">
            <Theme.Button
              transparent
              icon={Theme.Icon.Plus}
              onClick={() => createDream()}
            />
            {selectedDreams.length > 0 && dreams.length > 0 && (
              <Theme.Button
                transparent
                label="Delete selected"
                icon={Theme.Icon.Trash}
                onClick={() =>
                  deleteEntities(...selectedDreams.map((d) => d.id))
                }
              />
            )}
          </div>
          <div className="overflow-y-auto">
            {useMemo(
              () =>
                dreams.length > 0 ? (
                  dreams.flatMap(({ id }, index) => [
                    <Entity
                      key={id}
                      {...{ id, index, total: dreams.length }}
                    />,
                  ])
                ) : (
                  <div className="my-12 select-none text-center text-gray-500">
                    You don&apos;t have any dreams yet
                    <br />
                    <span
                      onClick={() => createDream()}
                      className="text-brand-300 cursor-pointer hover:underline"
                    >
                      Create
                    </span>
                    &nbsp;one to get started
                  </div>
                ),
              [createDream, dreams]
            )}
          </div>
        </App.Sidebar.Section>
        <App.Sidebar.Section collapsable divider defaultExpanded padding="none">
          <div className="flex border-b border-zinc-800 py-2 pl-1">
            <Theme.Button
              transparent
              icon={Theme.Icon.Upload}
              onClick={() => openFiles()}
            />
            {selectedImages.length > 0 && images.length > 0 && (
              <Theme.Button
                transparent
                label="Delete selected"
                icon={Theme.Icon.Trash}
                onClick={() =>
                  deleteEntities(...selectedImages.map((i) => i.id))
                }
              />
            )}
          </div>
          <div className="overflow-y-auto">
            {useMemo(
              () =>
                images.length > 0 ? (
                  images
                    .filter((e) => e.type === "image")
                    .flatMap(({ id }, index) => [
                      <Entity
                        key={id}
                        {...{ id, index, total: images.length }}
                      />,
                    ])
                ) : (
                  <div className="my-12 select-none text-center text-gray-500">
                    You don&apos;t have any images yet
                    <br />
                    Generate or&nbsp;
                    <span
                      onClick={() => openFiles()}
                      className="text-brand-300 cursor-pointer hover:underline"
                    >
                      import
                    </span>
                    &nbsp;some
                  </div>
                ),
              [images, openFiles]
            )}
          </div>
        </App.Sidebar.Section>
      </>
    );
  }
}

function Entity({ id, ...props }: { id: ID; index: number; total: number }) {
  const setCamera = Editor.Camera.useSet();

  const title = Editor.Entity.useTitle(id);
  const [entity] = Editor.Entity.use(id);

  const select = Editor.Selection.useSelect();
  const selection = Editor.Selection.use();
  const selected = useMemo(() => selection.has(id), [selection, id]);

  const onClick = useCallback(() => {
    if (!entity) return;
    if (!selected) select(entity.id);
    setCamera(entity);
  }, [entity, selected, select, setCamera]);

  return !entity ? null : (
    <div
      onClick={onClick}
      className={classes(
        "group flex items-center gap-3 p-2",
        selected ? "bg-brand-700" : "dark:hover:bg-zinc-800/50 hover:bg-zinc-300"
      )}
    >
      <Preview entity={entity} />
      <div className="grow overflow-hidden">
        <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">
          {title}
        </div>
      </div>
      <Controls {...{ id, ...props }} />
    </div>
  );
}

const Preview = ({ entity }: { entity: Editor.Entity }) => {
  const src = entity.type === "image" && entity.element?.src;
  return (
    <div className="relative aspect-square h-8 w-8 shrink-0 overflow-hidden rounded-md shadow">
      <Theme.Checkered size="sm" />
      {src && (
        <div
          className="absolute bottom-0 left-0 right-0 top-0"
          css={css`
            background-image: url(${src});
            background-size: cover;
            background-position: center;
          `}
        />
      )}
      <div className="relative flex h-full w-full items-center justify-center">
        {!src && (
          <Theme.Icon.Wand className="h-6 w-6 text-zinc-300 dark:text-zinc-500" />
        )}
        {entity && entity.type === "dream" && <Loading id={entity.id} />}
      </div>
    </div>
  );
};

function Loading({ id }: { id: ID }) {
  const { input } = Generation.Image.Input.use(id);
  input;

  return <Theme.Loading.Rainbow showing={false} className="blur-[8px]" />;
}

const Controls = ({ id }: { id: ID }) => {
  const deleteEntity = Editor.Entities.useDelete();
  const [entity, setEntity] = Editor.Entity.use(id);
  return (
    <div className="flex flex-col justify-between">
      {useMemo(() => {
        const className = "hidden group-hover:block";

        const visibilityIcon = (
          <Theme.Button
            transparent
            icon={entity?.visible ? Theme.Icon.Eye : Theme.Icon.EyeOff}
            className={className}
            onClick={(event) => {
              event.stopPropagation();
              setEntity((entity) => {
                entity.visible = !entity.visible;
              });
            }}
          />
        );

        const lockIcon = (
          <Theme.Button
            transparent
            icon={entity?.locked ? Theme.Icon.Lock : Theme.Icon.Unlock}
            className={className}
            onClick={(event) => {
              event.stopPropagation();
              setEntity((entity) => {
                entity.locked = !entity.locked;
              });
            }}
          />
        );

        const removeIcon = (
          <Theme.Button
            transparent
            icon={Theme.Icon.Trash}
            className={classes(
              className,
              "hover:text-red-500 dark:hover:text-red-500"
            )}
            onClick={(event) => {
              event.stopPropagation();
              deleteEntity(id);
            }}
          />
        );

        return (
          <div className="flex flex-row items-center gap-0.5">
            {visibilityIcon}
            {lockIcon}
            {removeIcon}
          </div>
        );
      }, [entity?.visible, entity?.locked, setEntity, deleteEntity, id])}
    </div>
  );
};

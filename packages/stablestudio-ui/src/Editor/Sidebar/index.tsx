import { App } from "~/App";
import { Editor } from "~/Editor";
import { Generation } from "~/Generation";
import { Router } from "~/Router";
import { Theme } from "~/Theme";

const tips = [
  "You can drag and drop images into the editor to import them",
  "Use the V key to switch to the select tool",
  "Use the E key to switch to the eraser tool",
  "Use the C key to switch to the snapshot tool",
  "You can use the mouse wheel to zoom in and out",
  "Try using multiple dreams to quickly switch between prompt and style presets",
  "You can use the mouse wheel to zoom in and out",
  "Hold shift to select multiple layers and move them together",
];

export function Sidebar() {
  const location = Router.useLocation();
  const selectedID = Editor.Selection.OnlyOne.use();
  const dreams = Editor.Entities.useType("dream") as Editor.Dream[];
  const [inputID, setInputID] = useState("");
  const createDream = Editor.Dream.Render.use(inputID);

  useEffect(() => {
    selectedID && setInputID(selectedID);
  }, [selectedID]);

  const outputID = useMemo(() => {
    const dream = dreams.filter((d) => d.id === selectedID)[0];
    return dream?.outputID;
  }, [dreams, selectedID]);

  const generating = Generation.Image.Output.useIsGenerating(outputID);
  const isDream = useMemo(
    () => dreams.filter(({ id }) => id === selectedID).length > 0,
    [dreams, selectedID]
  );

  const bottom = selectedID && (
    <App.Sidebar.Tab.Bottom>
      <Generation.Image.Create.Button
        id={inputID}
        onIdleClick={() => createDream()}
        fullWidth
        disabled={
          !inputID ||
          generating ||
          !(dreams.filter((d) => d.id === selectedID).length > 0)
        }
        loading={generating}
      />
    </App.Sidebar.Tab.Bottom>
  );

  return (
    <>
      <App.Sidebar.Tab.Set
        name="Edit"
        position="left"
        route="/edit"
        icon={Theme.Icon.Edit}
        bottom={bottom}
        enabled={
          location.pathname.startsWith("/generate") ||
          location.pathname.startsWith("/edit")
        }
        button={(props) => (
          <App.Sidebar.Tab.Button {...props} onClick={props.onClick}>
            Edit
          </App.Sidebar.Tab.Button>
        )}
      >
        <Editor.Tool.Sidebar.Section />
        {isDream && (
          <Generation.Image.Sidebar.Tab variant="editor" id={inputID} />
        )}
        {!isDream && selectedID && <Editor.Image.Sidebar.Tab id={selectedID} />}
        {!selectedID && <EmptySidebar />}
      </App.Sidebar.Tab.Set>
      <App.Sidebar.Tab.Set
        button={false}
        route="/edit"
        enabled={location.pathname.startsWith("/edit")}
        defaultActive
        name="Layers"
        position="right"
        icon={Theme.Icon.Layers}
      >
        <Editor.Entities.Sidebar.Section />
      </App.Sidebar.Tab.Set>
    </>
  );
}

function EditorSettings({ name }: { name?: string }) {
  const {
    color,
    setColor,
    allowSnapping,
    setAllowSnapping,
    autoFlatten,
    setAutoFlatten,
  } = Editor.State.use();

  const pickerRef = useRef<HTMLInputElement>(null);

  return (
    <App.Sidebar.Section
      divider
      title={name || "Settings"}
      defaultExpanded
      padding="sm"
    >
      <div className="flex flex-col gap-2 overflow-hidden px-1 pb-2">
        <div className="flex items-center justify-between">
          <Theme.Tooltip
            placement="right"
            content="Snap layers to anchor points based on other layers."
          >
            <h1 className="text-muted-white">Snapping</h1>
          </Theme.Tooltip>
          <Theme.Checkbox
            value={allowSnapping}
            onChange={setAllowSnapping}
            labelLeft
            labelClassName="text-muted-white mr-12"
          />
        </div>
        <div className="flex items-center justify-between">
          <Theme.Tooltip
            placement="right"
            content="Automatically combine chosen images with existing overlapping images on the canvas."
          >
            <h1 className="text-muted-white">Auto flatten</h1>
          </Theme.Tooltip>
          <Theme.Checkbox
            value={autoFlatten}
            onChange={setAutoFlatten}
            labelLeft
            labelClassName="text-muted-white mr-7"
          />
        </div>
        <div className="flex items-center justify-between">
          <Theme.Tooltip
            placement="right"
            content="Change the background color for the canvas."
          >
            <h1 className="text-muted-white">Background fill</h1>
          </Theme.Tooltip>

          <div className="flex items-center gap-3">
            <div
              className="relative aspect-square h-7 cursor-pointer rounded-md border border-zinc-800"
              style={{ backgroundColor: `#${color}` }}
              onMouseDown={() => {
                if (pickerRef.current) {
                  pickerRef.current.focus();
                  pickerRef.current.click();
                }
              }}
            >
              <input
                ref={pickerRef}
                type="color"
                className="pointer-events-none absolute inset-0 opacity-0"
                value={`#${color}`}
                onChange={(e) => {
                  setColor(e.target.value.replace("#", ""));
                }}
              />
            </div>
            <Theme.NumberInput icon="#" onChange={setColor} value={color} />
          </div>
        </div>
      </div>
    </App.Sidebar.Section>
  );
}

function EmptySidebar() {
  const createNewDreambox = Editor.Dream.Create.use();
  const uploadImage = Editor.Image.Import.useOpenFiles();

  const [tipIndex, setTipIndex] = useState(
    Math.ceil(Math.random() * (tips.length - 1))
  );

  return (
    <>
      <App.Sidebar.Section
        divider
        title="Add a dream"
        button={
          <Theme.Button
            icon={Theme.Icon.Plus}
            onClick={() => createNewDreambox()}
            transparent
          />
        }
      />
      <App.Sidebar.Section
        divider
        title="Upload"
        button={
          <Theme.Button
            icon={Theme.Icon.Upload}
            onClick={() => uploadImage()}
            transparent
          />
        }
      />
      <EditorSettings />
      <div
        className="absolute bottom-2 left-2 right-2 flex cursor-pointer select-none flex-col gap-2 justify-self-end rounded bg-zinc-800 p-2"
        onClick={() =>
          setTipIndex(Math.ceil(Math.random() * (tips.length - 1)))
        }
      >
        <h1 className="text-sm">Tip</h1>
        <h1 className="text-muted-white text-sm">{tips[tipIndex]}</h1>
      </div>
    </>
  );
}

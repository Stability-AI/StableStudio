import { useLocalStorage } from "react-use";
import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

export function Dropdown({ id, className }: Styleable & { id: ID }) {
  const { setInput, input } = Generation.Image.Input.use(id);
  const { data: models, isLoading } = Generation.Image.Models.use();

  const [value, setValue] = useLocalStorage<string | undefined>(
    "default-model-id",
    undefined
  );
  useEffect(() => {
    if (value) {
      setInput((input) => {
        input.model = value;
      });
    }
  }, []);

  const onClick = useCallback(
    (value: string) => {
      setInput((input) => {
        console.log("model", value);
        input.model = value;
        setValue(value);
      });
    },
    [setInput, setValue]
  );

  const options = useMemo(
    () => [
      ...(models ?? []).map(({ id, name }) => ({
        value: id,
        name:
          id === "stable-diffusion-xl-v2-2" ? (
            <>
              SDXL&nbsp;
              <Theme.New>Preview</Theme.New>
            </>
          ) : id === "stable-diffusion-xl-beta-v2-2-2" ? (
            <>
              SDXL Beta&nbsp;
              <Theme.New>Preview</Theme.New>
            </>
          ) : id === "stable-diffusion-xl-tiling-v2-2" ? (
            <>
              SDXL Tiling&nbsp;
              <Theme.New>Preview</Theme.New>
            </>
          ) : (
            name
          ),
      })),
    ],
    [models]
  );

  if (!input) return null;
  return (
    <Theme.Popout
      title="Model"
      label="Model"
      placeholder={isLoading ? "Loading..." : "Select a Model"}
      value={input.model}
      className={className}
      onClick={onClick}
      options={options}
      anchor="bottom"
    >
      {!models && (
        <div className="flex flex-col items-center justify-center px-16 py-32">
          <div className="text-muted-white pb-3">Loading models...</div>
        </div>
      )}
    </Theme.Popout>
  );
}

import { Link } from "react-router-dom";
import { Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export const Right = () => {
  const { setIsOpen } = Shortcut.Palette.use();
  const isMobileDevice = Theme.useIsMobileDevice();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.querySelectorAll("#modal-root, #app");

    if (root) {
      const elementsArray = [...root];
      elementsArray.forEach((element) => {
        if (dark) return element.classList.add("dark");
        element.classList.remove("dark");
      });
    }
  }, [dark]);
  return (
    <div className="flex grow basis-0 items-center justify-end gap-2">
      <>
        {!isMobileDevice && (
          <Theme.Button
            outline
            className="rounded-full"
            icon={Theme.Icon.Keyboard}
            onClick={() =>
              // cause a Ctrl+K to be triggered
              setIsOpen(true)
            }
          >
            Shortcuts
            <Shortcut.Keys keys={["Meta", "k"]} className="ml-2" />
          </Theme.Button>
        )}

        <Theme.Button
          outline
          onClick={() => setDark(!dark)}
          className="aspect-square h-[30px] w-[30px]"
          icon={dark ? Theme.Icon.Dark : Theme.Icon.Light}
        />

        <Link to="/settings">
          <Theme.Button
            outline
            label="Settings"
            labelPlacement="bottom"
            className="aspect-square h-[30px] w-[30px]"
            icon={Theme.Icon.Settings}
          />
        </Link>
      </>
    </div>
  );
};

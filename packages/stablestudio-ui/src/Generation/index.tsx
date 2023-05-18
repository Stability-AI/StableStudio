import { Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

import { Image, Images } from "./Image";

export function Generation() {
  const createDream = Generation.Image.Session.useCreateDream();

  Shortcut.use(
    useMemo(
      () => ({
        name: ["Generate"],
        keys: ["Meta", "Enter"],
        icon: Theme.Icon.Wand,
        action: () => createDream(),
        options: {
          ignoredElementWhitelist: ["INPUT", "TEXTAREA"],
        },
      }),
      [createDream]
    )
  );

  return (
    <>
      <Generation.Image.TopBar />
      <Generation.Image.Modal />
      <Generation.Image.Download.Modal />
      <div className="relative z-[1] flex h-full grow flex-col overflow-hidden bg-zinc-800">
        <Generation.Images />
      </div>
    </>
  );
}

export declare namespace Generation {
  export { Image, Images };
}

export namespace Generation {
  Generation.Image = Image;
  Generation.Images = Images;
}

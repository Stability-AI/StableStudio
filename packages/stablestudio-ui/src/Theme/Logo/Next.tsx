import { Logo } from ".";

export function Next() {
  return (
    <div className="flex items-center gap-1.5">
      <Logo />
      <div className="flex flex-col">
        <span className="text-lg font-medium">Ai Image Generator</span>
        <span className="-mt-1 text-xs font-light">
          <span className="text-white/75">by </span>Anirudh
        </span>
      </div>
    </div>
  );
}

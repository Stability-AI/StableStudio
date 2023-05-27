import { Logo } from ".";

export function Next() {
  return (
    <div className="flex items-center gap-1.5">
      <Logo />
      <div className="flex flex-col">
        <span className="text-lg font-medium">StableStudio</span>
        <span className="-mt-1 text-xs font-light">
        <span className="text-black/75 dark:text-white/75">by </span>
          stability.ai
        </span>
      </div>
    </div>
  );
}

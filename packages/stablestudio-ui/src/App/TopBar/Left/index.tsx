import { Link } from "react-router-dom";
import { Theme } from "~/Theme";

export const Left = () => {
  return (
    <div className="flex grow basis-0 items-center gap-4">
      <Link className="flex flex-row items-center gap-3" to="/">
        <Theme.Logo.Next />
      </Link>
    </div>
  );
};

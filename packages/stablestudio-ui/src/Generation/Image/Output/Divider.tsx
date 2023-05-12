import { format, formatDistance, intervalToDuration } from "date-fns";

import { Theme } from "~/Theme";

export function Divider({ dateTime }: { dateTime?: Date }) {
  const [now, setNow] = React.useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10 * 1000);
    return () => clearInterval(interval);
  });

  return useMemo(() => {
    const display = () => {
      if (!dateTime) return;

      const duration = intervalToDuration({
        start: dateTime,
        end: now,
      });

      const formatted =
        duration.days ?? 0 > 0
          ? format(dateTime, "LLL d, p")
          : formatDistance(dateTime, new Date(), { addSuffix: true });

      return formatted.replace("about ", "");
    };

    return <Theme.Divider className="mb-2 mt-4">{display()}</Theme.Divider>;
  }, [dateTime, now]);
}

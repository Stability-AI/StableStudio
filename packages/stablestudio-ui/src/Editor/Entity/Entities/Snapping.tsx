import { Line } from "react-konva";
import { Editor } from "~/Editor";
import { Box } from "~/Geometry";

export namespace Snapping {
  export type Line = { type: "origin" | "center" | "end" } & (
    | { x: number }
    | { y: number }
  );
  export type Lines = Line[];

  export const use = (id?: ID, snapDistance = 10) => {
    const entities = Editor.Entities.use();
    const { allowSnapping } = Editor.State.use();
    const [lines, setLines] = useState<Lines>([]);

    const snapLines = useMemo(
      () =>
        allowSnapping
          ? entities
              .filter((entity) => entity.id !== id)
              .flatMap((entity) => {
                const { x, y, width, height } = entity;
                return [
                  { x: x + width / 2, type: "center" },
                  { y: y + height / 2, type: "center" },
                  { x: x + width, type: "end" },
                  { y: y + height, type: "end" },
                  { x, type: "origin" },
                  { y, type: "origin" },
                ] as Line[];
              })
          : [],
      [allowSnapping, entities, id]
    );

    const snapComponent = () => {
      if (!allowSnapping) return null;

      return (
        <>
          {lines.map((line, index) => {
            if ("x" in line) {
              return (
                <Line
                  key={"x" + line.x + index}
                  points={[line.x, -999999, line.x, 999999]}
                  strokeWidth={2}
                  stroke="red"
                />
              );
            }
            if ("y" in line) {
              return (
                <Line
                  key={"y" + line.y + index}
                  points={[-999999, line.y, 999999, line.y]}
                  strokeWidth={2}
                  stroke="red"
                />
              );
            }
          })}
        </>
      );
    };

    const snap = useCallback(
      (box: Box) => {
        if (!allowSnapping) return box;

        const entitySnapLines = [
          { x: box.x + box.width / 2, type: "center" as const },
          { x: box.x + box.width, type: "end" as const },
          { x: box.x, type: "origin" as const },
          { y: box.y + box.height / 2, type: "center" as const },
          { y: box.y + box.height, type: "end" as const },
          { y: box.y, type: "origin" as const },
        ];

        const distances = snapLines
          .flatMap((snapLine) => {
            return entitySnapLines
              .filter((entityLine) => "x" in snapLine === "x" in entityLine)
              .map((entityLine) => {
                const axis = "x" in snapLine ? "x" : "y";

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                const distance = Math.abs(snapLine[axis] - entityLine[axis]);

                return distance <= snapDistance
                  ? { distance, line: snapLine, type: entityLine.type }
                  : null;
              });
          })
          .filter((d) => d !== null)
          .sort((a, b) => (a?.distance ?? 0) - (b?.distance ?? 0));

        if (distances.length > 0) {
          // get one x and one y
          const Xline = distances.find((d) => d && "x" in (d?.line ?? {}));
          const Yline = distances.find((d) => d && "y" in (d?.line ?? {}));

          if (Xline && "x" in Xline.line) {
            if (Xline.type === "origin") {
              box.x = Xline.line.x;
            } else if (Xline.type === "center") {
              box.x = Xline.line.x - box.width / 2;
            } else if (Xline.type === "end") {
              box.x = Xline.line.x - box.width;
            }
          }

          if (Yline && "y" in Yline.line) {
            if (Yline.type === "origin") {
              box.y = Yline.line.y;
            } else if (Yline.type === "center") {
              box.y = Yline.line.y - box.height / 2;
            } else if (Yline.type === "end") {
              box.y = Yline.line.y - box.height;
            }
          }

          setLines(
            [Xline?.line, Yline?.line].filter((l) => l !== undefined) as Lines
          );
          return box;
        }

        setLines([]);
        return box;
      },
      [allowSnapping, snapDistance, snapLines]
    );

    return [snapComponent, snap, setLines] as const;
  };
}

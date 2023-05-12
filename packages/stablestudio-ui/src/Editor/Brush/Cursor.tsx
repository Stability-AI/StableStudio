import { Editor } from "~/Editor";

export function Cursor() {
  const [activeTool] = Editor.Tool.Active.use();
  const [show, setShow] = useState(false);
  const svg = useRef<SVGSVGElement>(null);

  const { size, strength } = Editor.Brush.use();

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (
        svg.current &&
        show &&
        activeTool === "brush" &&
        e.clientX &&
        e.clientY
      ) {
        svg.current.style.left = e.clientX - size / 2 + "px";
        svg.current.style.top = e.clientY - size / 2 + "px";
        svg.current.style.display = "block";
        svg.current.style.cursor = "none";
      } else if (svg.current) {
        svg.current.style.display = "none";
      }
    }

    window.addEventListener("mousemove", handleMouseMove);

    document
      .getElementById("canvas-container")
      ?.addEventListener("mouseenter", () => setShow(true));

    document
      .getElementById("canvas-container")
      ?.addEventListener("mouseleave", () => setShow(false));

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);

      document
        .getElementById("canvas-container")
        ?.removeEventListener("mouseenter", () => setShow(true));

      document
        .getElementById("canvas-container")
        ?.removeEventListener("mouseleave", () => setShow(false));
    };
  }, [svg, activeTool, size, show]);

  if (show && activeTool === "brush") {
    document.body.style.cursor = "none";
    return (
      <svg
        className="pointer-events-none absolute hidden"
        style={{ zIndex: 1000, opacity: strength }}
        width={size + 2}
        height={size + 2}
        ref={svg}
      >
        <circle
          fill="transparent"
          stroke="white"
          strokeWidth="2"
          r={size / 2}
          cx={size / 2 + 1}
          cy={size / 2 + 1}
        />
      </svg>
    );
  } else {
    document.body.style.cursor = "default";
    return null;
  }
}

import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

import { ClipBoard } from "./ClipBoard";
import { Controls } from "./Controls";
import { Count } from "./Count";
import { Create } from "./Create";
import { Download } from "./Download";
import { Exception } from "./Exception";
import { HTMLElement } from "./HTMLElement";
import { Images } from "./Images";
import { Input, Inputs } from "./Input";
import { Modal } from "./Modal";
import { Model, Models } from "./Model";
import { Output, Outputs } from "./Output";
import { Prompt, Prompts } from "./Prompt";
import { Sampler, Samplers } from "./Sampler";
import { Search } from "./Search";
import { Session } from "./Session";
import { Sidebar } from "./Sidebar";
import { Size } from "./Size";
import { SpecialEffects } from "./SpecialEffects";
import { Style, Styles } from "./Style";
import { TopBar } from "./TopBar";
import { Upscale, Upscales } from "./Upscale";
import { Variations } from "./Variation";

export * from "./Images";

export type Image = {
  id: ID;
  inputID: ID;
  created?: Date;
  src?: string;
  finishReason?: number;
};

type Props = Styleable &
  Size.Display.Options & {
    image?: Partial<Generation.Image>;
    example?: Generation.Image.Prompt.Examples.Example;
    hideControls?: boolean;
    placeholder?: boolean;

    onClick?: () => void;
    onDelete?: () => void;
  };

export function Image({
  image,
  // example,
  hideControls,
  placeholder,

  scale,
  preserveAspectRatio,

  width,
  height,

  onClick: propsOnClick,

  className,
}: Props) {
  const { input } = Input.use(image?.inputID);
  // const { input: currentInput } = Generation.Image.Session.useCurrentInput();
  // const create = Generation.Image.Create.use();

  const style = Size.Display.useStyle({
    scale,
    preserveAspectRatio,

    width: width ?? input?.width,
    height: height ?? input?.height,
  });

  const src =
    image?.src &&
    (style.width && style.height
      ? Image.cropped(image.src, style.width, style.height)
      : image.src);

  const [isElementRendering, setIsElementRendering] = useState(true);

  const isGenerating = !src;
  const shouldShowSpecialEffects = placeholder || isGenerating;

  const isUpscaled = useMemo(
    () => input && Generation.Image.Input.isUpscaling(input),
    [input]
  );

  useEffect(() => setIsElementRendering(true), [image?.src]);

  const openModal = Generation.Images.Modal.useOpen();
  const onClick = useCallback(() => {
    propsOnClick?.();
    !isElementRendering && !!image?.id && openModal(image as Generation.Image);
  }, [propsOnClick, image, isElementRendering, openModal]);

  const element = useMemo(
    () =>
      image?.id && (
        <div className="absolute h-full w-full">
          <HTMLElement
            src={src}
            image={image as Generation.Image}
            onClick={onClick}
            onLoadingChange={setIsElementRendering}
          />
          {isUpscaled && (
            <div className="absolute bottom-3 left-3 flex items-end justify-end">
              <Theme.Badge className="bg-zinc-800/50 backdrop-blur-md">
                Upscaled {input?.width}x{input?.height}
              </Theme.Badge>
            </div>
          )}
        </div>
      ),
    [image, src, onClick, isUpscaled, input?.width, input?.height]
  );

  const controls = useMemo(
    () =>
      image?.id &&
      !isElementRendering &&
      !hideControls && <Controls image={image as Generation.Image} />,
    [image, isElementRendering, hideControls]
  );

  // const onTryTemplate = useCallback(() => {
  //   if (!currentInput || !example) return;

  //   Generation.Image.Session.setCurrentInput((currentInput) => ({
  //     ...currentInput,
  //     prompts: [
  //       {
  //         text: example?.prompt,
  //         weight: 1,
  //       },
  //       {
  //         text: "",
  //         weight: -0.75,
  //       },
  //     ],
  //   }));

  //   create({
  //     inputID: currentInput.id,
  //   });
  // }, [currentInput, example, create]);

  const specialEffects = useMemo(
    () => (
      <Image.SpecialEffects
        showing={shouldShowSpecialEffects}
        loading={!placeholder && shouldShowSpecialEffects}
        variant={(style.height ?? 512) < 48 ? "small" : undefined}
        // example={example}
        // onClick={example ? onTryTemplate : undefined}
        // input={currentInput?.id}
      />
    ),
    [placeholder, shouldShowSpecialEffects, style.height]
  );

  return useMemo(
    () => (
      <div
        style={style}
        className={classes(
          "group relative shrink grow overflow-hidden rounded bg-white dark:bg-zinc-900",
          className
        )}
      >
        <div
          className={classes(
            "group relative h-full w-full overflow-hidden rounded-md shadow-md",
            !isElementRendering && "cursor-pointer",
            className
          )}
        >
          {element}
          {controls}
          {specialEffects}
        </div>
      </div>
    ),
    [style, className, isElementRendering, element, controls, specialEffects]
  );
}

export declare namespace Image {
  export {
    ClipBoard,
    Controls,
    Count,
    Create,
    Download,
    HTMLElement,
    Input,
    Inputs,
    Modal,
    Model,
    Models,
    Output,
    Outputs,
    Style,
    Styles,
    Prompt,
    Prompts,
    Sampler,
    Samplers,
    Search,
    Session,
    Sidebar,
    Size,
    SpecialEffects,
    TopBar,
    Variations,
    Upscales,
    Upscale,
    Exception,
  };
}

export namespace Image {
  Image.ClipBoard = ClipBoard;
  Image.Controls = Controls;
  Image.Count = Count;
  Image.Create = Create;
  Image.Download = Download;
  Image.HTMLElement = HTMLElement;
  Image.Input = Input;
  Image.Inputs = Inputs;
  Image.Modal = Modal;
  Image.Model = Model;
  Image.Models = Models;
  Image.Output = Output;
  Image.Outputs = Outputs;
  Image.Style = Style;
  Image.Styles = Styles;
  Image.Prompt = Prompt;
  Image.Prompts = Prompts;
  Image.Sampler = Sampler;
  Image.Samplers = Samplers;
  Image.Search = Search;
  Image.Session = Session;
  Image.Sidebar = Sidebar;
  Image.Size = Size;
  Image.SpecialEffects = SpecialEffects;
  Image.TopBar = TopBar;
  Image.Variations = Variations;
  Image.Upscales = Upscales;
  Image.Upscale = Upscale;
  Image.Exception = Exception;

  export const get = (id: ID): Image | undefined =>
    Images.State.use(({ images }) => images[id]);

  export const add = (image: Image) => Images.add([image]);

  export const cropped = (src: string, width: number, height: number): string =>
    src.startsWith("blob:")
      ? src
      : `${src}?resize&width=${width}&height=${height}&fit=cover`;

  export const blob = async (image: Generation.Image) => {
    const src = image?.src;
    if (!src) return;

    const response = await fetch(src);
    return response.blob();
  };

  export const blobURL = async (image: Generation.Image) => {
    const blob = await Image.blob(image);
    return blob && URL.createObjectURL(blob);
  };
}

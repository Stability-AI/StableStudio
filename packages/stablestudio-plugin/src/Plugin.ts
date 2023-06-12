import { createStore, StoreApi } from "zustand";

/**
 * Function used to create a `Plugin`
 *
 * ```ts
 * import * as StableStudio from "@stability/stablestudio-plugin";
 *
 * // You need to export your plugin like this...
 * export const createPlugin = StableStudio.createPlugin(() => ({}));
 * ```
 *
 * It returns a function waiting for `PluginCreateContext` as an argument, which the UI provides
 */
export const createPlugin =
  <P extends PluginTypeHelper>(
    createPlugin: (options: {
      context: PluginCreateContext;
      set: StoreApi<Plugin<P>>["setState"];
      get: StoreApi<Plugin<P>>["getState"];
    }) => Plugin<P>
  ) =>
  (context: PluginCreateContext) =>
    createStore<Plugin<P>>((set, get) => createPlugin({ set, get, context }));

/** `PluginCreateContext` is passed to the `createPlugin` function and provides some useful functions */
type PluginCreateContext = {
  /** Get the git hash of the repository */
  getGitHash: () => string;

  /** Get a random prompt for image generation */
  getStableDiffusionRandomPrompt: () => string;
};

/** `PluginManifest` is used to describe your plugin on the settings page */
export type PluginManifest = {
  /** What is your plugin called? */
  name?: string;

  /** A link to your plugin's icon */
  icon?: URLString;

  /** A link to your plugin's website */
  link?: URLString;

  /** Your plugin version, no versioning schema is currently enforced */
  version?: string;

  /** What's the license, no licensing schema is currently enforced */
  license?: string;

  /** Who made this plugin? */
  author?: string;

  /** What does your plugin do? */
  description?: Markdown;
};

export type PluginSettingCommon = {
  /** What is your plugin called? */
  title?: string;

  /** What is your plugin called? */
  description?: Markdown;

  /** Is this setting required? If so, users will be forced to provide an input */
  required?: boolean;
};

/** `PluginSetting` allows for `string`, `number`, and `boolean` input types   */
export type PluginSetting<T> =
  | PluginSettingString<T>
  | PluginSettingNumber<T>
  | PluginSettingBoolean<T>;

/** `PluginSetting` which is displayed and input as a `string` */
export type PluginSettingString<T = string> = PluginSettingCommon & {
  type: "string";

  /** The current `value` */
  value?: T;

  /** If you provide `options`, this will become a dropdown */
  options?: { label: string; value: T }[];

  /** The `placeholder` input `string` */
  placeholder?: string;

  /** Given a `value`, how should it be displayed? Useful if your value is a `Date` for example */
  formatter?: (value: T) => string;

  /** Given a `string`, how should it be saved as a `value`? */
  parser?: (string: string) => T;

  /** Determines whether this input is displayed as a `password` type */
  password?: boolean;
};

/** `PluginSetting` which is displayed and input as a `number` */
export type PluginSettingNumber<T = number> = PluginSettingCommon & {
  type: "number";

  /** The current `value` */
  value?: T;

  /** The `placeholder` input `number` */
  placeholder?: number;

  /** Enforces an inclusive `min` allowed `value` */
  min?: number;

  /** Enforces an inclusive `max` allowed `value` */
  max?: number;

  /** Enforces a `step` size between each `value` */
  step?: number;

  /** Given a `value`, how can it formatted as a `number`? */
  formatter?: (value: T) => number;

  /** Given a `number`, how should it be saved as a `value`? */
  parser?: (value: number) => T;

  /** Determines whether to use a slider or input. Uses `input` by default */
  variant?: "slider" | "input";
};

/** `PluginSetting` which is displayed and input as a `boolean` */
export type PluginSettingBoolean<T = boolean> = PluginSettingCommon & {
  type: "boolean";

  /** The current `value` */
  value?: T;
};

/** `PluginStatus` is displayed via an indicator on the `/settings` page */
export type PluginStatus = {
  /** Determines the text displayed next to the `indicator` icon */
  text?: string;

  /** Determines the `indicator` color and icon */
  indicator?: "success" | "error" | "warning" | "info" | "loading";
};

/** `PluginSettings` is a map of the settings your plugin will show on the `/settings` page */
export type PluginSettings = {
  /** Each setting needs a unique `key` */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [settingKey: string]: PluginSetting<any>;
};

/** Useful for strictly-typing things */
export type PluginTypeHelper = { settings?: PluginSettings };
export type PluginTypeHelperDefault = { settings: undefined };

/** The `Plugin` type defines the API which StableStudio uses to provide functionality via plugins */
export type Plugin<P extends PluginTypeHelper = PluginTypeHelperDefault> = {
  /** You should provide a `PluginManifest`, otherwise the UI shows a warning */
  manifest?: PluginManifest;

  /** The most fundamental function needed for stable diffusion generations */
  createStableDiffusionImages?: (options?: {
    /** The `StableDiffusionInput` you've been asked to generate, if empty, you could still return a random image */
    input?: StableDiffusionInput;

    /** Determines how many images will be created using the given `StableDiffusionInput` */
    count?: number;
  }) => MaybePromise<StableDiffusionImages | undefined>;

  /** This function provides historical access to generated images. If omitted, the app will lose its history on refresh */
  getStableDiffusionExistingImages?: (options?: {
    /** How many images the UI is requesting */
    limit?: number;

    /** The `ID` of last image the UI has access to, it should be omitted from the response */
    exclusiveStartImageID?: ID;
  }) => MaybePromise<StableDiffusionImages[] | undefined>;

  /** If more than one `StableDiffusionModel`, you can return them via this function and they will be presented as a dropdown in the UI */
  getStableDiffusionModels?: () => MaybePromise<
    StableDiffusionModel[] | undefined
  >;

  /** If more than one `StableDiffusionSampler`, you can return them via this function and they will be presented as a dropdown in the UI */
  getStableDiffusionSamplers?: () => MaybePromise<
    StableDiffusionSampler[] | undefined
  >;

  /** If more than one `StableDiffusionStyle`, you can return them via this function and they will be presented as a dropdown in the UI */
  getStableDiffusionStyles?: () => MaybePromise<
    StableDiffusionStyle[] | undefined
  >;

  /** Determines the default count passed to `createStableDiffusionImages` */
  getStableDiffusionDefaultCount?: () => number | undefined;

  /** Determines the default input passed to `createStableDiffusionImages` and is also used when setting up a new generation */
  getStableDiffusionDefaultInput?: () => StableDiffusionInput | undefined;
  // export type StableDiffusionExtras = {
  //
  getStableDiffusionExtras?: () => StableDiffusionExtra[] | undefined;

  /** If you support deleting existing images by `ID`, this function will enable a deletion UI */
  deleteStableDiffusionImages?: (options?: {
    imageIDs?: ID[];
  }) => MaybePromise<void>;

  /** Determines whether to display a `PluginStatus` and sets its contents */
  getStatus?: () => MaybePromise<PluginStatus | undefined>;

  /** If your plugin has `settings` you want to make available on the `/settings page, you can declare them here`  */
  settings?: P["settings"];

  /** Handles changes in `settings`, you'll need to actually use Zustand's `set` to persist the change */
  setSetting?: (
    settingKey: keyof P["settings"],
    value: string | number | boolean
  ) => void;
} & P;

export declare type UIExtraBadge = {
  type: "badge";
  data: string;
  variant: "outline" | undefined;
  size: "sm" | "md" | "lg" | "xl";
  color: "brand" | "indigo" | "red" | "green" | "yellow" | "zinc";
  className: string;
};

// export declare type UIExtraButton = {
//     type: "button";
//     size: "sm" | "md" | "lg" | "xl";
//     fullWidth: boolean;
//     color: "brand" | "indigo" | "red" | "green" | "yellow" | "zinc" | "darkerZinc";
//     outline: boolean;
//     transparent: boolean;
//     translucent: boolean;
//     autoFocus: boolean;
//     active: boolean;
//     disabled: boolean;
//     selected: boolean;
//     itemsCenter: boolean;
//     className: string;
// }

export declare type UIExtraCheckbox = {
  type: "checkbox";
  label: string;
  labelLeft: boolean;
  labelClassName: string;
  size: "sm" | "md" | "lg" | "xl";
  variant: "indigo" | "red" | "green" | "yellow" | "gray";
  disabled: boolean;
  bold: boolean;
  left: boolean;
  right: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
};

export declare type UIExtraDropdownItem = {
  type: "dropdownItem";
  value: string;
  label: string;
  description: string;
  disabled: boolean;
};

export declare type UIExtraDropdown<
  Options extends UIExtraDropdownItem[] = UIExtraDropdownItem[],
  Item extends UIExtraDropdownItem = UIExtraDropdownItem,
  Value extends Item["value"] = Item["value"]
> = {
  type: "dropdown";
  value: Value;
  options: Options;
  onChange: (item: Item) => void;
  title: string;
  placeholder: string;
  size: "sm" | "md" | "lg" | "xl";
  noPadding: boolean;
  transparent: boolean;
  disabled: boolean;
  fullWidth: boolean;
  fixed: boolean;
  innerClassName: string;
};

export declare type StableDiffusionExtraText = {
  type: "text";
  data: string;
  default: string;
};

export declare type StableDiffusionExtraNumber = {
  type: "number";
  data: number;
  default: number;
};

export declare type StableDiffusionExtraBoolean = {
  type: "boolean";
  data: boolean;
  default: boolean;
};

export declare type StableDiffusionExtraList = {
  type: "list";
  data: string[] | number[] | boolean[] | any[];
  default: string | number | boolean | any;
};

export declare type StableDiffusionExtraSlider = {
  type: "slider";
  data: number;
  min: number;
  max: number;
  step: number;
  default: number;
};

export declare type StableDiffusionExtraSelect = {
  type: "select";
  data: string | number | boolean | any;
  options: StableDiffusionExtraList;
  default: string | number | boolean | any;
};

export declare type StableDiffusionExtraData =
  | StableDiffusionExtraText
  | StableDiffusionExtraNumber
  | StableDiffusionExtraBoolean
  | StableDiffusionExtraList
  | StableDiffusionExtraSlider
  | StableDiffusionExtraSelect;

export declare type StableDiffusionExtraType =
  | "text"
  | "number"
  | "boolean"
  | "list"
  | "slider"
  | "select";

export declare type StableDiffusionExtra = {
  name: string;
  description: string;
  type: StableDiffusionExtraType;
  data: StableDiffusionExtraData;
};

export type StableDiffusionInput = {
  prompts?: StableDiffusionPrompt[];

  /** If `getStableDiffusionModels` is available and a `StableDiffusionModel` is selected, this is its `ID` */
  model?: ID;

  /** If `getStableDiffusionStyles` is available and a `StableDiffusionStyle` is selected, this is its `ID` */
  style?: ID;

  width?: number;
  height?: number;

  sampler?: StableDiffusionSampler;
  cfgScale?: number;
  steps?: number;
  seed?: number;

  /** `StableDiffusionInputImage` in the form of a black and white mask used for in-painting and out-painting */
  maskImage?: StableDiffusionInputImage;

  /** `StableDiffusionInputImage` which is used for image-to-image generations such as creating variations */
  initialImage?: StableDiffusionInputImage;
};

export type StableDiffusionPrompt = {
  text?: string;

  /** Value between `-1` and `1` */
  weight?: number;
};

/** This controls how a `StableDiffusionModel` is displayed in the UI */
export type StableDiffusionModel = {
  id: ID;
  name?: string;
  description?: string;
  image?: URLString;
};

/** This controls how a `StableDiffusionStyle` is displayed in the UI */
export type StableDiffusionStyle = {
  id: ID;
  name?: string;
  description?: string;
  image?: URLString;
};

/** This controls how a `StableDiffusionSampler` is displayed in the UI */
export declare type StableDiffusionSampler = {
  id: ID;
  name?: string;
};

export type StableDiffusionInputImage = {
  blob?: Blob;

  /** Value between `0` and `1` */
  weight?: number;
};

/** Since multiple images can be generated at once, this is how they are grouped */
export type StableDiffusionImages = {
  id: ID;

  /** If `exclusiveStartImageID` is set, this means more images exist for this group and the `ID` is passed to `getStableDiffusionExistingImages` */
  exclusiveStartImageID?: ID;

  images?: StableDiffusionImage[];
};

export type StableDiffusionImage = {
  id: ID;

  createdAt?: Date;

  /** The `StableDiffusionInput` used to create this image */
  input?: StableDiffusionInput;

  blob?: Blob;
};

/** Allows both asynchronous and synchronous return types */
type MaybePromise<T> = T | Promise<T>;

/** In this context, an `ID` represents a unique-within-this-plugin `ID`, no schema is enforced */
export type ID = string;

/** A valid URL */
export type URLString = string;

/** Markdown string which is rendered as markdown in the UI */
export type Markdown = string;

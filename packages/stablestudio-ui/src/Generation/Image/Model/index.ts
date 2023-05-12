import { Dropdown } from "./Dropdown";
import { StableDiffusionV1 } from "./StableDiffusionV1";

export * from "./Models";

export declare namespace Model {
  export { StableDiffusionV1, Dropdown };
}

export namespace Model {
  Model.StableDiffusionV1 = StableDiffusionV1;
  Model.Dropdown = Dropdown;
}

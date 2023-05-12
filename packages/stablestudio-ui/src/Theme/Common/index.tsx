export namespace Common {
  export type Size = "sm" | "md" | "lg" | "xl";
  export namespace Size {
    export const preset = (): Size => "md";
  }

  export type Color = "brand" | "indigo" | "red" | "green" | "yellow" | "zinc";
  export namespace Color {
    export const preset = (): Color => "zinc";
  }
}

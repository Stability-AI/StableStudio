export namespace Event {
  export type Options = {
    preventDefault?: boolean;
    stopPropagation?: boolean;
  };

  export namespace Options {
    export const presets = (): Options => ({
      preventDefault: true,
      stopPropagation: true,
    });
  }
}

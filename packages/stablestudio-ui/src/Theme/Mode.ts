export type Mode = "system" | "light" | "dark";
export namespace Mode {
  export const use = () =>
    useMemo(
      () => ({
        dark: true,
        systemPrefersDark: true,
      }),
      []
    );
}

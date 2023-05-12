export type Cursor = {
  forward: boolean;
  limit: number;
  stopID?: ID;
};

export namespace Cursor {
  const limit = () => 50;

  export const initial = (_stopDate = new Date()): Cursor => ({
    forward: false,
    limit: limit(),
  });

  export const next = (cursor: Cursor): Cursor => ({
    ...cursor,
    forward: true,
  });

  export const previous = (cursor: Cursor): Cursor => ({
    ...cursor,
    forward: false,
  });
}

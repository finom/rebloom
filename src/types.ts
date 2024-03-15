// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KnownAny = any;

export type Handler<TValue> = (
  value: TValue,
  prev: TValue
) => KnownAny;

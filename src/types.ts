// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KnownAny = any;

export type SliceRecord<SLICE> = SLICE & Partial<Record<keyof SLICE, unknown>>;

export type Handler<VALUE> = (
  value: VALUE,
  prev: VALUE
) => KnownAny;

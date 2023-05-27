import { useValue } from 'use-change';

// eslint-disable-next-line @typescript-eslint/no-use-before-define
export const of = <DATA extends object>(data?: DATA) => new Use0(data) as Use0 & DATA;

export default class Use0 {
  constructor(data?: object) {
    if (data) {
      Object.assign(this, data);
    }
  }

  readonly use = <KEY extends keyof this>(key: KEY) => useValue<typeof this, KEY>(this, key);

  static readonly of = of;
}

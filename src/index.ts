import { useValue } from 'use-change';

// eslint-disable-next-line @typescript-eslint/no-use-before-define
export const act = <DATA extends object>(data: DATA): Act0 & DATA => new Act0(data) as Act0 & DATA;

export default class Act0 {
  constructor(data?: object) {
    if (data) {
      Object.assign(this, data);
    }
  }

  readonly use = <KEY extends keyof this>(key: KEY) => useValue<typeof this, KEY>(this, key);

  static readonly act = act;
}

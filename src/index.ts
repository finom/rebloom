import { useValue } from 'use-change';

class Use0 {
  constructor(data?: object) {
    if (data) {
      Object.assign(this, data);
    }
  }

  readonly use = <KEY extends keyof this>(key: KEY) => useValue<typeof this, KEY>(this, key);

  static readonly data = <DATA extends object>(data: DATA): Use0 & DATA => new Use0(data) as Use0 & DATA;
}

export default Use0;

import getUse from './getUse';
import { extendedTimesSymbol } from './symbols';

export default function createRecord<T>(init?: Partial<T>) {
    type State = T & { [extendedTimesSymbol]: number };

    type Rec = State & {
      use: ReturnType<typeof getUse<State>>;
      useRecordValues: () => State[keyof State][];
      useRecord: () => State;
      getRecordValues: () => State[keyof State][];
      getRecord: () => State;
      extend: (ext: Partial<T>) => State;
    };

    const record: Rec = {
      ...init as T,
      [extendedTimesSymbol]: 0,
      use: getUse<State>(),
      useRecordValues(this: Rec) {
        this.use(extendedTimesSymbol);
        return this.getRecordValues();
      },
      useRecord(this: Rec) {
        this.use(extendedTimesSymbol);
        return this.getRecord();
      },
      getRecordValues(this: Rec) {
        return Object.values(this.getRecord());
      },
      getRecord(this: Rec) {
        return this;
      },
      extend(this: Rec, ext: Partial<T>) {
        for (const [key, value] of Object.entries(ext)) {
          this[key as keyof Rec] = value as Rec[keyof Rec];
        }
        this[extendedTimesSymbol] += 1;
        return this;
      },
    };

    const descriptor: PropertyDescriptor = { enumerable: false, writable: false, configurable: false };

    Object.defineProperties(record, {
      use: descriptor,
      useAllAsArray: descriptor,
      useAll: descriptor,
      getAllAsArray: descriptor,
      getAll: descriptor,
      extend: descriptor,
    });

    return record;
}

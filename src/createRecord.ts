import getUse from './getUse';
import { extendedTimesSymbol } from './symbols';

export default function createRecord<T extends object>(init?: Partial<T>) {
    type Symbols = { [extendedTimesSymbol]: number };
    type State = T & Symbols;

    type Lib = {
      use: ReturnType<typeof getUse<T & Symbols>>;
      useRecordValues: () => T[keyof T][];
      useRecord: () => T;
      getRecordValues: () => T[keyof T][];
      getRecord: () => T;
      extend: (ext: Partial<T>) => T;
    };

    type Rec = State & Lib;

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
        return Object.values(this.getRecord()) as T[keyof T][];
      },
      getRecord(this: Rec) {
        return this;
      },
      extend(this: Rec, ext: Partial<T>) {
        let isChanged = false;
        for (const [key, value] of Object.entries(ext)) {
          if (this[key as keyof Rec] !== value) {
            isChanged = true;
            this[key as keyof Rec] = value as Rec[keyof Rec];
          }
        }
        if (isChanged) {
          this[extendedTimesSymbol] += 1;
        }
        return this;
      },
    };

    record[extendedTimesSymbol] = 0;

    const descriptor: PropertyDescriptor = { enumerable: false, writable: false, configurable: false };

    Object.defineProperties(record, {
      [extendedTimesSymbol]: { enumerable: false, writable: true, configurable: true },
      use: descriptor,
      useRecordValues: descriptor,
      useRecord: descriptor,
      getRecordValues: descriptor,
      getRecord: descriptor,
      extend: descriptor,
    } satisfies Record<keyof Lib & Symbols, PropertyDescriptor>);

    return record;
}

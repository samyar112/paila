const store = new Map<string, string | boolean | number>();

export function createMMKV() {
  return {
    id: 'test',
    length: store.size,
    byteSize: 0,
    isReadOnly: false,
    isEncrypted: false,
    set: (key: string, value: string | boolean | number) => { store.set(key, value); },
    getString: (key: string) => { const v = store.get(key); return typeof v === 'string' ? v : undefined; },
    getBoolean: (key: string) => { const v = store.get(key); return typeof v === 'boolean' ? v : undefined; },
    getNumber: (key: string) => { const v = store.get(key); return typeof v === 'number' ? v : undefined; },
    getBuffer: () => undefined,
    contains: (key: string) => store.has(key),
    remove: (key: string) => store.delete(key),
    getAllKeys: () => [...store.keys()],
    clearAll: () => store.clear(),
    recrypt: () => {},
    encrypt: () => {},
    decrypt: () => {},
    trim: () => {},
    addOnValueChangedListener: () => ({ remove: () => {} }),
    importAllFrom: () => 0,
  };
}

export function __resetStore() { store.clear(); }

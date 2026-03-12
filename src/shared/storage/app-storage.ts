import { createMMKV } from 'react-native-mmkv';

const STORAGE_PROBE_KEY = 'system.scaffold.probe';
const STORAGE_PROBE_VALUE = 'ready';

export const appStorage = createMMKV({
  id: 'paila.app',
});

export function verifyAppStorage(): boolean {
  try {
    appStorage.set(STORAGE_PROBE_KEY, STORAGE_PROBE_VALUE);
    const storedValue = appStorage.getString(STORAGE_PROBE_KEY);
    return storedValue === STORAGE_PROBE_VALUE;
  } catch {
    return false;
  }
}

export function clearAppStorage(): void {
  appStorage.clearAll();
}

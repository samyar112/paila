import { appStorage } from '../shared/storage/app-storage';
import { STORAGE_KEYS } from '../shared/storage/storage-keys';

export function isNepalLocal(): boolean {
  const code = appStorage.getString(STORAGE_KEYS.COUNTRY_CODE);
  return code === 'NP';
}

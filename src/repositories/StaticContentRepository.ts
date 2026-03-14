import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
} from '@react-native-firebase/firestore';
import { appStorage as storage } from '../shared/storage/app-storage';
import { STORAGE_KEYS } from '../shared/storage/storage-keys';
import {
  routeSchema,
  milestoneSchema,
  assetBundleSchema,
  routeCharacterSchema,
  type RouteDoc,
  type MilestoneDoc,
  type AssetBundleDoc,
  type RouteCharacterDoc,
} from '../shared/schemas';
import { type ZodSchema } from 'zod';
import { COLLECTIONS } from '../shared/paths';

function cacheKey(collection: string, id: string): string {
  return `${STORAGE_KEYS.STATIC_CONTENT_PREFIX}${collection}:${id}`;
}

function cacheVersionKey(collection: string, id: string): string {
  return `${STORAGE_KEYS.STATIC_CONTENT_PREFIX}${collection}:${id}:version`;
}

export class StaticContentRepository {
  static async getRoute(routeId: string): Promise<RouteDoc | null> {
    const cached = this.readCacheValidated(COLLECTIONS.routes, routeId, routeSchema);
    if (cached) return cached;

    const db = getFirestore();
    const snap = await getDoc(doc(collection(db, COLLECTIONS.routes), routeId));
    if (!snap.exists) return null;

    const parsed = routeSchema.safeParse(snap.data());
    if (!parsed.success) return null;
    this.writeCache(COLLECTIONS.routes, routeId, parsed.data);
    return parsed.data;
  }

  static async getMilestones(routeId: string): Promise<MilestoneDoc[]> {
    const cacheId = `milestones_${routeId}`;
    const cached = this.readCache<MilestoneDoc[]>(COLLECTIONS.milestones, cacheId);
    if (cached) return cached;

    const db = getFirestore();
    const milestonesRef = collection(
      doc(collection(db, COLLECTIONS.routes), routeId),
      COLLECTIONS.milestones,
    );
    const snap = await getDocs(query(milestonesRef, orderBy('index', 'asc')));

    const milestones: MilestoneDoc[] = [];
    for (const doc of snap.docs) {
      const parsed = milestoneSchema.safeParse(doc.data());
      if (parsed.success) milestones.push(parsed.data);
    }
    this.writeCache(COLLECTIONS.milestones, cacheId, milestones);
    return milestones;
  }

  static async getAssetBundle(
    assetBundleId: string,
  ): Promise<AssetBundleDoc | null> {
    const cached = this.readCacheValidated(
      COLLECTIONS.assetBundles,
      assetBundleId,
      assetBundleSchema,
    );
    if (cached) return cached;

    const db = getFirestore();
    const snap = await getDoc(doc(collection(db, COLLECTIONS.assetBundles), assetBundleId));
    if (!snap.exists) return null;

    const parsed = assetBundleSchema.safeParse(snap.data());
    if (!parsed.success) return null;
    this.writeCache(COLLECTIONS.assetBundles, assetBundleId, parsed.data);
    return parsed.data;
  }

  static async getCharacter(
    routeId: string,
    characterId: string,
  ): Promise<RouteCharacterDoc | null> {
    const cacheId = `${routeId}_${characterId}`;
    const cached = this.readCacheValidated(
      COLLECTIONS.characters,
      cacheId,
      routeCharacterSchema,
    );
    if (cached) return cached;

    const db = getFirestore();
    const charactersRef = collection(
      doc(collection(db, COLLECTIONS.routes), routeId),
      COLLECTIONS.characters,
    );
    const snap = await getDoc(doc(charactersRef, characterId));
    if (!snap.exists) return null;

    const parsed = routeCharacterSchema.safeParse(snap.data());
    if (!parsed.success) return null;
    this.writeCache(COLLECTIONS.characters, cacheId, parsed.data);
    return parsed.data;
  }

  static invalidateRoute(routeId: string): void {
    storage.remove(cacheKey(COLLECTIONS.routes, routeId));
    storage.remove(cacheVersionKey(COLLECTIONS.routes, routeId));
    storage.remove(cacheKey(COLLECTIONS.milestones, `milestones_${routeId}`));
    storage.remove(
      cacheVersionKey(COLLECTIONS.milestones, `milestones_${routeId}`),
    );
  }

  private static readCache<T>(collection: string, id: string): T | null {
    const key = cacheKey(collection, id);
    const raw = storage.getString(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      storage.remove(key);
      return null;
    }
  }

  private static readCacheValidated<S extends ZodSchema>(
    collection: string,
    id: string,
    schema: S,
  ): ReturnType<S['parse']> | null {
    const key = cacheKey(collection, id);
    const raw = storage.getString(key);
    if (!raw) return null;
    try {
      const parsed = schema.safeParse(JSON.parse(raw));
      if (parsed.success) return parsed.data;
      storage.remove(key);
      return null;
    } catch {
      storage.remove(key);
      return null;
    }
  }

  private static writeCache<T>(
    collection: string,
    id: string,
    data: T,
  ): void {
    storage.set(cacheKey(collection, id), JSON.stringify(data));
  }
}

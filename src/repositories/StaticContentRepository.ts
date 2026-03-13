import firestore from '@react-native-firebase/firestore';
import { appStorage as storage } from '../shared/storage/app-storage';
import type {
  RouteDoc,
  MilestoneDoc,
  AssetBundleDoc,
} from '../shared/schemas';
import { COLLECTIONS } from '../shared/paths';

const CACHE_PREFIX = 'static_content:';

function cacheKey(collection: string, id: string): string {
  return `${CACHE_PREFIX}${collection}:${id}`;
}

function cacheVersionKey(collection: string, id: string): string {
  return `${CACHE_PREFIX}${collection}:${id}:version`;
}

export class StaticContentRepository {
  static async getRoute(routeId: string): Promise<RouteDoc | null> {
    const cached = this.readCache<RouteDoc>(COLLECTIONS.routes, routeId);
    if (cached) return cached;

    const snap = await firestore()
      .collection(COLLECTIONS.routes)
      .doc(routeId)
      .get();
    if (!snap.exists) return null;

    const data = snap.data() as RouteDoc;
    this.writeCache(COLLECTIONS.routes, routeId, data);
    return data;
  }

  static async getMilestones(routeId: string): Promise<MilestoneDoc[]> {
    const cacheId = `milestones_${routeId}`;
    const cached = this.readCache<MilestoneDoc[]>(COLLECTIONS.milestones, cacheId);
    if (cached) return cached;

    const snap = await firestore()
      .collection(COLLECTIONS.routes)
      .doc(routeId)
      .collection(COLLECTIONS.milestones)
      .orderBy('index', 'asc')
      .get();

    const milestones = snap.docs.map((doc) => doc.data() as MilestoneDoc);
    this.writeCache(COLLECTIONS.milestones, cacheId, milestones);
    return milestones;
  }

  static async getAssetBundle(
    assetBundleId: string,
  ): Promise<AssetBundleDoc | null> {
    const cached = this.readCache<AssetBundleDoc>(
      COLLECTIONS.assetBundles,
      assetBundleId,
    );
    if (cached) return cached;

    const snap = await firestore()
      .collection(COLLECTIONS.assetBundles)
      .doc(assetBundleId)
      .get();
    if (!snap.exists) return null;

    const data = snap.data() as AssetBundleDoc;
    this.writeCache(COLLECTIONS.assetBundles, assetBundleId, data);
    return data;
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

  private static writeCache<T>(
    collection: string,
    id: string,
    data: T,
  ): void {
    storage.set(cacheKey(collection, id), JSON.stringify(data));
  }
}

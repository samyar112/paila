import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

import { COLLECTIONS } from '../../src/shared/paths';
import {
  buildRouteDoc,
  buildMilestoneDocs,
  buildCharacterDoc,
  buildAssetBundleDocs,
} from './everest-seed-data';

/**
 * seedFirestore — HTTPS callable Cloud Function.
 *
 * Populates the dev Firestore with Everest route data:
 *   - Route doc at routes/everest-summit
 *   - 16 Milestone docs under routes/everest-summit/milestones/{slug}
 *   - Pemba character doc at routes/everest-summit/characters/pemba-dorje-sherpa
 *   - 16 AssetBundle docs at assetBundles/everest-{slug}
 *
 * Safety: rejects if the project is not a dev project.
 * Idempotent: uses set({ merge: true }) so it can be called repeatedly.
 */
export const seedFirestore = onCall(async (_request) => {
  // ── Guard: only allow on dev projects ──────────────────────────
  const projectId =
    process.env.GCLOUD_PROJECT ??
    admin.app().options.projectId ??
    '';

  if (!projectId.includes('dev')) {
    throw new HttpsError(
      'failed-precondition',
      'Seeding is only allowed on dev projects',
    );
  }

  const db = admin.firestore();
  const now = new Date();
  const batch = db.batch();
  let opCount = 0;

  // ── 1. Route doc ───────────────────────────────────────────────
  const routeRef = db
    .collection(COLLECTIONS.routes)
    .doc('everest-summit');
  batch.set(routeRef, buildRouteDoc(now), { merge: true });
  opCount += 1;

  // ── 2. Milestone docs ─────────────────────────────────────────
  for (const m of buildMilestoneDocs(now)) {
    const milestoneRef = routeRef
      .collection(COLLECTIONS.milestones)
      .doc(m.slug);
    batch.set(milestoneRef, m.doc, { merge: true });
    opCount += 1;
  }

  // ── 3. Pemba character doc ────────────────────────────────────
  const characterRef = routeRef
    .collection(COLLECTIONS.characters)
    .doc('pemba-dorje-sherpa');
  batch.set(characterRef, buildCharacterDoc(now), { merge: true });
  opCount += 1;

  // ── 4. Asset bundle docs ──────────────────────────────────────
  for (const ab of buildAssetBundleDocs(now)) {
    const bundleRef = db
      .collection(COLLECTIONS.assetBundles)
      .doc(ab.id);
    batch.set(bundleRef, ab.doc, { merge: true });
    opCount += 1;
  }

  // ── Commit ────────────────────────────────────────────────────
  await batch.commit();

  logger.info('seedFirestore completed', {
    projectId,
    operations: opCount,
    route: 'everest-summit',
    milestones: 16,
    characters: 1,
    assetBundles: 16,
  });

  return {
    success: true,
    operations: opCount,
    seeded: {
      route: 'routes/everest-summit',
      milestones: 16,
      characters: ['routes/everest-summit/characters/pemba-dorje-sherpa'],
      assetBundles: 16,
    },
  };
});

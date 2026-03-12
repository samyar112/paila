import { readFileSync } from 'fs';
import path from 'path';

import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import {
  routeDocPath,
  userDocPath,
  userJourneyPath,
  journeyLedgerPath,
} from '../src/shared/paths';

const projectId = 'demo-paila';
const rulesPath = path.resolve(__dirname, '..', 'firestore.rules');

describe('firestore rules', () => {
  const testEnvPromise = initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync(rulesPath, 'utf8'),
    },
  });

  afterAll(async () => {
    const testEnv = await testEnvPromise;
    await testEnv.cleanup();
  });

  it('allows a user to read their own user document', async () => {
    const testEnv = await testEnvPromise;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), userDocPath('user_1')), {
        authUid: 'user_1',
        createdAt: new Date(),
      });
    });

    const db = testEnv.authenticatedContext('user_1').firestore();
    await expect(getDoc(doc(db, userDocPath('user_1')))).resolves.toBeDefined();
  });

  it('blocks a user from reading another user document', async () => {
    const testEnv = await testEnvPromise;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), userDocPath('user_2')), {
        authUid: 'user_2',
        createdAt: new Date(),
      });
    });

    const db = testEnv.authenticatedContext('user_1').firestore();
    await expect(getDoc(doc(db, userDocPath('user_2')))).rejects.toBeTruthy();
  });

  it('allows reading published routes only', async () => {
    const testEnv = await testEnvPromise;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), routeDocPath('ebc')), { isPublished: true });
      await setDoc(doc(context.firestore(), routeDocPath('private')), { isPublished: false });
    });

    const db = testEnv.authenticatedContext('user_1').firestore();
    await expect(getDoc(doc(db, routeDocPath('ebc')))).resolves.toBeDefined();
    await expect(getDoc(doc(db, routeDocPath('private')))).rejects.toBeTruthy();
  });

  it('blocks client writes to journeys and ledger', async () => {
    const testEnv = await testEnvPromise;
    const db = testEnv.authenticatedContext('user_1').firestore();
    await expect(
      setDoc(doc(db, userJourneyPath('user_1', 'j1')), { userId: 'user_1' }),
    ).rejects.toBeTruthy();

    await expect(
      setDoc(doc(db, journeyLedgerPath('user_1', 'j1', '2026-03-10')), {
        userId: 'user_1',
      }),
    ).rejects.toBeTruthy();
  });
});

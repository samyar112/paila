import {
  AppleAuthProvider,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  type FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { getGoogleWebClientId } from '../../shared/config/app-env';
import { clearAppStorage } from '../../shared/storage/app-storage';
import { resetAllStores } from '../../stores/resetAllStores';

let googleConfigured = false;

export function configureGoogleSignIn(): void {
  if (googleConfigured) {
    return;
  }

  const webClientId = getGoogleWebClientId();
  if (webClientId) {
    GoogleSignin.configure({ webClientId });
  }
  googleConfigured = true;
}

export async function signInWithApple(): Promise<FirebaseAuthTypes.UserCredential> {
  const request = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });

  if (!request.identityToken) {
    throw new Error('Apple sign-in failed to return identity token.');
  }

  const credential = AppleAuthProvider.credential(
    request.identityToken,
    request.nonce,
  );

  return signInWithCredential(getAuth(), credential);
}

export async function signInWithGoogle(): Promise<FirebaseAuthTypes.UserCredential> {
  const webClientId = getGoogleWebClientId();
  if (!webClientId) {
    throw new Error('Google web client id is not configured.');
  }
  configureGoogleSignIn();
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken;
  if (!idToken) {
    throw new Error('Google sign-in failed to return id token.');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(getAuth(), credential);
}

export async function signOut(): Promise<void> {
  // Reset all Zustand stores first (sync, safe even if network down)
  resetAllStores();

  // Clear Google Sign-In session
  try {
    await GoogleSignin.signOut();
  } catch {
    // Ignore if Google Sign-In was not used.
  }

  // Clear all local storage
  clearAppStorage();

  // Sign out from Firebase Auth last (may require network)
  try {
    await firebaseSignOut(getAuth());
  } catch {
    // Local cleanup already done — safe to proceed even if network fails
  }
}

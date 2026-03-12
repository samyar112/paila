import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { getGoogleWebClientId } from '../../shared/config/app-env';
import { clearAppStorage } from '../../shared/storage/app-storage';

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

  const credential = auth.AppleAuthProvider.credential(
    request.identityToken,
    request.nonce,
  );

  return auth().signInWithCredential(credential);
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

  const credential = auth.GoogleAuthProvider.credential(idToken);
  return auth().signInWithCredential(credential);
}

export async function signOut(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Ignore if Google Sign-In was not used.
  }
  await auth().signOut();
  clearAppStorage();
}

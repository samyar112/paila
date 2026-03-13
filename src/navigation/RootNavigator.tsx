import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer, useNavigationContainerRef, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';

import { ScaffoldShellScreen } from '../screens/ScaffoldShellScreen';
import { JourneyHomeScreen } from '../screens/journey/JourneyHomeScreen';
import { CheckpointDecisionSheet } from '../screens/journey/CheckpointDecisionSheet';
import { MilestoneCeremonyScreen } from '../screens/journey/MilestoneCeremonyScreen';
import { AirplaneIntroScreen } from '../screens/journey/AirplaneIntroScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { PurchaseInvitationScreen } from '../screens/purchase/PurchaseInvitationScreen';
import { DeleteAccountScreen } from '../screens/settings/DeleteAccountScreen';
import { colors } from '../shared/theme/placeholder-theme';
import { useJourneyStore, selectIsPaywallFrozen } from '../stores/useJourneyStore';
import { useCeremonyStore } from '../stores/useCeremonyStore';
import { appStorage } from '../shared/storage/app-storage';
import { STORAGE_KEYS } from '../shared/storage/storage-keys';
import { signOut } from '../services/auth/AuthService';
import { RouteContentProvider } from '../shared/content/RouteContentContext';
import { getRouteContent, getDefaultRouteContent } from '../shared/content/route-content-registry';

type RootStackParamList = {
  Onboarding: undefined;
  AirplaneIntro: undefined;
  ScaffoldShell: { firestoreCheck: 'pending' | 'ok' | 'error' | 'skipped' };
  JourneyHome: undefined;
  Purchase: undefined;
  DeleteAccount: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const NOOP = () => {};

const navigationTheme: Theme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    notification: colors.notification,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

export function RootNavigator({
  firestoreCheck,
  userId,
}: {
  firestoreCheck: 'pending' | 'ok' | 'error' | 'skipped';
  userId: string;
}) {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const journey = useJourneyStore((s) => s.journey);
  const isPaywallFrozen = useJourneyStore(selectIsPaywallFrozen);
  const route = useJourneyStore((s) => s.route);
  const lastDismissedAction = useCeremonyStore((s) => s.lastDismissedAction);
  const clearLastDismissedAction = useCeremonyStore((s) => s.clearLastDismissedAction);

  const routeContent = route ? getRouteContent(route.slug) : getDefaultRouteContent();

  const [hasOnboarded, setHasOnboarded] = useState(
    () => appStorage.getBoolean(STORAGE_KEYS.HAS_ONBOARDED) === true,
  );
  const [introSeen, setIntroSeen] = useState(
    () => appStorage.getBoolean(STORAGE_KEYS.INTRO_SEEN) === true,
  );

  const handleOnboardingComplete = useCallback((countryCode: string) => {
    appStorage.set(STORAGE_KEYS.HAS_ONBOARDED, true);
    appStorage.set(STORAGE_KEYS.COUNTRY_CODE, countryCode);
    setHasOnboarded(true);
  }, []);

  const handleIntroComplete = useCallback(() => {
    appStorage.set(STORAGE_KEYS.INTRO_SEEN, true);
    setIntroSeen(true);
  }, []);

  const handleDeleteComplete = useCallback(() => {
    void signOut();
  }, []);

  const handlePurchaseComplete = useCallback(() => {
    void useJourneyStore.getState().loadJourney(userId);
  }, [userId]);

  const handleReturnHome = useCallback(() => {
    void useJourneyStore.getState().chooseReturnHome(userId);
    if (navigationRef.isReady()) {
      navigationRef.navigate('JourneyHome');
    }
  }, [userId, navigationRef]);

  useEffect(() => {
    if (!lastDismissedAction) return;
    if (!navigationRef.isReady()) return;

    if (lastDismissedAction === 'paywall') {
      navigationRef.navigate('Purchase');
    }
    // For 'complete', JourneyHomeScreen reads journey.journeyState === 'COMPLETED'
    clearLastDismissedAction();
  }, [lastDismissedAction, clearLastDismissedAction, navigationRef]);

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <RouteContentProvider content={routeContent}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: styles.navigatorContent,
          animation: 'fade',
        }}
      >
        {!hasOnboarded ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
          </Stack.Screen>
        ) : journey && !introSeen ? (
          <Stack.Screen name="AirplaneIntro">
            {() => <AirplaneIntroScreen onComplete={handleIntroComplete} />}
          </Stack.Screen>
        ) : journey ? (
          <>
            <Stack.Screen name="JourneyHome">
              {() => (
                <>
                  <JourneyHomeScreen userId={userId} />
                  <CheckpointDecisionSheet userId={userId} />
                  <MilestoneCeremonyScreen />
                </>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Purchase"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            >
              {() => (
                <PurchaseInvitationScreen
                  routeName={route?.name ?? routeContent.routeName}
                  productId={route?.premiumContentPackId ?? routeContent.routeId}
                  priceLabel="$4.99"
                  onPurchaseComplete={handlePurchaseComplete}
                  onReturnHome={handleReturnHome}
                  onDismiss={NOOP}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="DeleteAccount"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            >
              {() => (
                <DeleteAccountScreen
                  onDeleteComplete={handleDeleteComplete}
                  onCancel={NOOP}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="ScaffoldShell">
            {() => (
              <ScaffoldShellScreen
                firestoreCheck={firestoreCheck}
                userId={userId}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
      </RouteContentProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  navigatorContent: {
    backgroundColor: colors.background,
  },
});

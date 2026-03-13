import { NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';

import { ScaffoldShellScreen } from '../screens/ScaffoldShellScreen';
import { JourneyHomeScreen } from '../screens/journey/JourneyHomeScreen';
import { CheckpointDecisionSheet } from '../screens/journey/CheckpointDecisionSheet';
import { placeholderTheme } from '../shared/theme/placeholder-theme';
import { useJourneyStore } from '../stores/useJourneyStore';

type RootStackParamList = {
  ScaffoldShell: { firestoreCheck: 'pending' | 'ok' | 'error' | 'skipped' };
  JourneyHome: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme: Theme = {
  dark: false,
  colors: {
    primary: placeholderTheme.primary,
    background: placeholderTheme.background,
    card: placeholderTheme.card,
    text: placeholderTheme.text,
    border: placeholderTheme.border,
    notification: placeholderTheme.notification,
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '800',
    },
  },
};

export function RootNavigator({
  firestoreCheck,
  userId,
}: {
  firestoreCheck: 'pending' | 'ok' | 'error' | 'skipped';
  userId: string;
}) {
  const journey = useJourneyStore((s) => s.journey);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: styles.navigatorContent,
          animation: 'fade',
        }}
      >
        {journey ? (
          <Stack.Screen name="JourneyHome">
            {() => (
              <>
                <JourneyHomeScreen userId={userId} />
                <CheckpointDecisionSheet userId={userId} />
              </>
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="ScaffoldShell">
            {() => <ScaffoldShellScreen firestoreCheck={firestoreCheck} userId={userId} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  navigatorContent: {
    backgroundColor: placeholderTheme.background,
  },
});

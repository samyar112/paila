import { NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';

import { ScaffoldShellScreen } from '../screens/ScaffoldShellScreen';
import { placeholderTheme } from '../shared/theme/placeholder-theme';

type RootStackParamList = {
  ScaffoldShell: undefined;
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

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: styles.navigatorContent,
          animation: 'fade',
        }}
      >
        <Stack.Screen component={ScaffoldShellScreen} name="ScaffoldShell" />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  navigatorContent: {
    backgroundColor: placeholderTheme.background,
  },
});

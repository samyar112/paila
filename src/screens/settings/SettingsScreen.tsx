import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from '@react-native-firebase/auth';
import Constants from 'expo-constants';

import { colors, typography, radii, shadows } from '../../shared/theme/placeholder-theme';
import { APP_STRINGS } from '../../shared/content/strings';
import { appStorage } from '../../shared/storage/app-storage';
import { STORAGE_KEYS } from '../../shared/storage/storage-keys';
import { COUNTRIES, type Country } from '../../shared/data/countries';
import { signOut } from '../../services/auth/AuthService';
import { EntitlementService } from '../../services/entitlement/EntitlementService';

const PRIVACY_URL = 'https://paila.app/privacy';
const TERMS_URL = 'https://paila.app/terms';

export function SettingsScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const user = getAuth().currentUser;
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const [countryCode, setCountryCode] = useState<string>(
    () => appStorage.getString(STORAGE_KEYS.COUNTRY_CODE) ?? '',
  );
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [isRestoringPurchases, setIsRestoringPurchases] = useState(false);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode);

  const handleSignOut = useCallback(() => {
    void signOut();
  }, []);

  const handleSelectCountry = useCallback((country: Country) => {
    appStorage.set(STORAGE_KEYS.COUNTRY_CODE, country.code);
    setCountryCode(country.code);
    setCountryPickerVisible(false);
  }, []);

  const handleRestorePurchases = useCallback(async () => {
    setIsRestoringPurchases(true);
    try {
      const result = await EntitlementService.restorePurchases();
      Alert.alert(
        '',
        result.ok
          ? APP_STRINGS.settings.restoreSuccess
          : APP_STRINGS.settings.restoreFailed,
      );
    } catch {
      Alert.alert('', APP_STRINGS.settings.restoreFailed);
    } finally {
      setIsRestoringPurchases(false);
    }
  }, []);

  const handleOpenPrivacy = useCallback(() => {
    void Linking.openURL(PRIVACY_URL);
  }, []);

  const handleOpenTerms = useCallback(() => {
    void Linking.openURL(TERMS_URL);
  }, []);

  const handleDeleteAccount = useCallback(() => {
    navigation.navigate('DeleteAccount' as never);
  }, [navigation]);

  const renderCountryItem = useCallback(
    ({ item }: { item: Country }) => (
      <TouchableOpacity
        style={[
          pickerStyles.countryItem,
          item.code === countryCode && pickerStyles.countryItemSelected,
        ]}
        onPress={() => handleSelectCountry(item)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            pickerStyles.countryName,
            item.code === countryCode && pickerStyles.countryNameSelected,
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    ),
    [countryCode, handleSelectCountry],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>{APP_STRINGS.settings.title}</Text>

        {/* Account Section */}
        <Text style={styles.sectionHeader}>{APP_STRINGS.settings.accountSection}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{APP_STRINGS.settings.email}</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
              {user?.email ?? '—'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.rowButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text style={styles.rowButtonText}>{APP_STRINGS.settings.signOut}</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionHeader}>{APP_STRINGS.settings.preferencesSection}</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setCountryPickerVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>{APP_STRINGS.settings.country}</Text>
            <Text style={styles.rowValue}>
              {selectedCountry?.name ?? '—'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <Text style={styles.sectionHeader}>{APP_STRINGS.settings.supportSection}</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.rowButton}
            onPress={handleOpenPrivacy}
            activeOpacity={0.7}
          >
            <Text style={styles.rowButtonText}>{APP_STRINGS.settings.privacyPolicy}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.rowButton}
            onPress={handleOpenTerms}
            activeOpacity={0.7}
          >
            <Text style={styles.rowButtonText}>{APP_STRINGS.settings.termsOfService}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.rowButton}
            onPress={() => void handleRestorePurchases()}
            activeOpacity={0.7}
            disabled={isRestoringPurchases}
          >
            <Text
              style={[
                styles.rowButtonText,
                isRestoringPurchases && styles.rowButtonTextDisabled,
              ]}
            >
              {APP_STRINGS.settings.restorePurchases}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionHeader}>{APP_STRINGS.settings.dangerSection}</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.rowButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Text style={styles.dangerText}>{APP_STRINGS.settings.deleteAccount}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.versionText}>
          {APP_STRINGS.settings.version} {appVersion}
        </Text>
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal
        visible={countryPickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCountryPickerVisible(false)}
      >
        <View style={pickerStyles.container}>
          <View style={pickerStyles.header}>
            <Text style={pickerStyles.headerTitle}>
              {APP_STRINGS.settings.selectCountry}
            </Text>
            <TouchableOpacity
              onPress={() => setCountryPickerVisible(false)}
              activeOpacity={0.7}
              style={pickerStyles.closeButton}
            >
              <Text style={pickerStyles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={COUNTRIES}
            keyExtractor={(item) => item.code}
            renderItem={renderCountryItem}
            contentContainerStyle={pickerStyles.list}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: 24,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  rowLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  rowValue: {
    ...typography.body,
    color: colors.mutedText,
    flexShrink: 1,
    marginLeft: 16,
    textAlign: 'right',
  },
  rowButton: {
    padding: 16,
  },
  rowButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  rowButtonTextDisabled: {
    opacity: 0.4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 16,
  },
  dangerText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
  versionText: {
    ...typography.caption,
    color: colors.mutedText,
    textAlign: 'center',
    marginTop: 32,
  },
});

const pickerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.heading,
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    ...typography.bodyLarge,
    color: colors.mutedText,
  },
  list: {
    padding: 16,
  },
  countryItem: {
    padding: 14,
    borderRadius: radii.sm,
  },
  countryItemSelected: {
    backgroundColor: colors.sage,
  },
  countryName: {
    ...typography.body,
    color: colors.text,
  },
  countryNameSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
});

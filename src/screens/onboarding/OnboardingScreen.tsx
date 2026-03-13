import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, radii, typography, shadows } from '../../shared/theme/placeholder-theme';
import { PrimaryButton } from '../../components/shared/PrimaryButton';
import { useRouteContent } from '../../shared/content/RouteContentContext';
import { APP_STRINGS } from '../../shared/content/strings';
import { COUNTRIES, type Country } from '../../shared/data/countries';

interface OnboardingScreenProps {
  onComplete: (countryCode: string) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps): React.JSX.Element {
  const routeContent = useRouteContent();
  const SLIDES = [
    ...routeContent.onboarding.slides,
    { title: APP_STRINGS.ads.title, subtitle: APP_STRINGS.ads.subtitle },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const isLastSlide = currentSlide === SLIDES.length;

  const filteredCountries = useMemo(() => {
    if (!searchText.trim()) return COUNTRIES;
    const query = searchText.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query),
    );
  }, [searchText]);

  const handleNext = (): void => {
    if (currentSlide < SLIDES.length) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleSelectCountry = useCallback((country: Country) => {
    setSelectedCountry(country);
    setSearchText(country.name);
  }, []);

  const handleComplete = (): void => {
    onComplete(selectedCountry?.code ?? 'US');
  };

  const renderCountryItem = useCallback(({ item }: { item: Country }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        selectedCountry?.code === item.code && styles.countryItemSelected,
      ]}
      onPress={() => handleSelectCountry(item)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.countryName,
        selectedCountry?.code === item.code && styles.countryNameSelected,
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [selectedCountry, handleSelectCountry]);

  if (isLastSlide) {
    const showList = searchText.length > 0 && (!selectedCountry || searchText !== selectedCountry.name);

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.slideContent}>
          <Text style={styles.title}>{routeContent.onboarding.countryPicker.title}</Text>
          <Text style={styles.subtitle}>
            {routeContent.onboarding.countryPicker.subtitle}
          </Text>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              if (selectedCountry && text !== selectedCountry.name) {
                setSelectedCountry(null);
              }
            }}
            placeholder={routeContent.onboarding.countryPicker.placeholder}
            placeholderTextColor={colors.sage}
            autoCorrect={false}
            autoCapitalize="words"
          />
          {showList && (
            <View style={styles.dropdownContainer}>
              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.code}
                renderItem={renderCountryItem}
                style={styles.dropdown}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
              />
            </View>
          )}
          {selectedCountry && (
            <Text style={styles.selectedLabel}>{selectedCountry.name}</Text>
          )}
          <PrimaryButton
            label={APP_STRINGS.onboarding.beginJourney}
            onPress={handleComplete}
            variant="accent"
            disabled={!selectedCountry}
            style={styles.beginButton}
          />
        </View>
        <View style={styles.dots}>
          {[...SLIDES, null].map((_, i) => (
            <View key={i} style={[styles.dot, i === currentSlide && styles.dotActive]} />
          ))}
        </View>
      </KeyboardAvoidingView>
    );
  }

  const slide = SLIDES[currentSlide]!;

  return (
    <View style={styles.container}>
      <View style={styles.slideContent}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>
      <View style={styles.dots}>
        {[...SLIDES, null].map((_, i) => (
          <View key={i} style={[styles.dot, i === currentSlide && styles.dotActive]} />
        ))}
      </View>
      <PrimaryButton label={APP_STRINGS.onboarding.next} onPress={handleNext} variant="inverse" style={styles.nextButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.background,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: colors.sage,
  },
  searchInput: {
    marginTop: 24,
    borderWidth: 2,
    borderColor: colors.sage,
    borderRadius: radii.md,
    padding: 14,
    fontSize: 17,
    fontWeight: '600',
    color: colors.background,
  },
  dropdownContainer: {
    maxHeight: 200,
    marginTop: 8,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    ...shadows.md,
  },
  dropdown: {
    borderRadius: radii.md,
  },
  countryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  countryItemSelected: {
    backgroundColor: colors.accentDeep,
  },
  countryName: {
    ...typography.body,
    color: colors.text,
  },
  countryNameSelected: {
    color: colors.background,
    fontWeight: '700',
  },
  selectedLabel: {
    marginTop: 12,
    ...typography.label,
    color: colors.sage,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.sage,
    opacity: 0.4,
  },
  dotActive: {
    opacity: 1,
    backgroundColor: colors.background,
  },
  nextButton: {
    marginBottom: 40,
  },
  beginButton: {
    marginTop: 32,
  },
});

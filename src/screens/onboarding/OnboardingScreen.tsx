import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { colors, radii } from '../../shared/theme/placeholder-theme';
import { PrimaryButton } from '../../components/shared/PrimaryButton';
import { useRouteContent } from '../../shared/content/RouteContentContext';
import { APP_STRINGS } from '../../shared/content/strings';

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
  const [countryCode, setCountryCode] = useState('');

  const isLastSlide = currentSlide === SLIDES.length;

  const handleNext = (): void => {
    if (currentSlide < SLIDES.length) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleComplete = (): void => {
    const code = countryCode.trim().toUpperCase();
    onComplete(code.length === 2 ? code : 'US');
  };

  if (isLastSlide) {
    // Country selection
    return (
      <View style={styles.container}>
        <View style={styles.slideContent}>
          <Text style={styles.title}>{routeContent.onboarding.countryPicker.title}</Text>
          <Text style={styles.subtitle}>
            {routeContent.onboarding.countryPicker.subtitle}
          </Text>
          <TextInput
            style={styles.input}
            value={countryCode}
            onChangeText={setCountryCode}
            placeholder={routeContent.onboarding.countryPicker.placeholder}
            placeholderTextColor={colors.sage}
            maxLength={2}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <PrimaryButton label={APP_STRINGS.onboarding.beginJourney} onPress={handleComplete} variant="accent" style={styles.beginButton} />
        </View>
        <View style={styles.dots}>
          {[...SLIDES, null].map((_, i) => (
            <View key={i} style={[styles.dot, i === currentSlide && styles.dotActive]} />
          ))}
        </View>
      </View>
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
  input: {
    marginTop: 32,
    borderWidth: 2,
    borderColor: colors.sage,
    borderRadius: radii.md,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    color: colors.background,
    textAlign: 'center',
    letterSpacing: 4,
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

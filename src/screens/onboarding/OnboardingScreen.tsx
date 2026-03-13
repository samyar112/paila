import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { colors, radii } from '../../shared/theme/placeholder-theme';
import { PrimaryButton } from '../../components/shared/PrimaryButton';

interface OnboardingScreenProps {
  onComplete: (countryCode: string) => void;
}

const SLIDES = [
  {
    title: 'Every Step Counts',
    subtitle: 'Your daily walking steps carry you along real trails around the world.',
  },
  {
    title: 'Everest Awaits',
    subtitle: 'Your first journey takes you from Lukla to the summit of Everest and back to Kathmandu. 340 kilometers. Every step is yours.',
  },
  {
    title: 'The Mountain Is Patient',
    subtitle: 'Walk at your pace. Rest when you need. Pemba, your guide, walks with you every step.',
  },
  {
    title: 'Ad Supports the App',
    subtitle: 'We show a small ad to keep Paila free. It never affects your journey progress, steps, or data. Unlock the full trek to remove ads.',
  },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps): React.JSX.Element {
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
          <Text style={styles.title}>Where are you from?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your journey. Enter your country code (e.g. US, NP, UK).
          </Text>
          <TextInput
            style={styles.input}
            value={countryCode}
            onChangeText={setCountryCode}
            placeholder="Country code (e.g. NP)"
            placeholderTextColor={colors.sage}
            maxLength={2}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <PrimaryButton label="Begin Journey" onPress={handleComplete} variant="accent" style={styles.beginButton} />
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
      <PrimaryButton label="Next" onPress={handleNext} variant="inverse" style={styles.nextButton} />
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

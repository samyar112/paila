import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

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
  const { width } = useWindowDimensions();
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
            placeholderTextColor="#C4B89B"
            maxLength={2}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.beginButton}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.beginButtonText}>Begin Journey</Text>
          </TouchableOpacity>
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
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2A43',
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
    color: '#F6F3ED',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: '#C4B89B',
  },
  input: {
    marginTop: 32,
    borderWidth: 2,
    borderColor: '#C4B89B',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#F6F3ED',
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
    backgroundColor: '#C4B89B',
    opacity: 0.4,
  },
  dotActive: {
    opacity: 1,
    backgroundColor: '#F6F3ED',
  },
  nextButton: {
    backgroundColor: '#F6F3ED',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 40,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F2A43',
  },
  beginButton: {
    backgroundColor: '#4A6741',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
  },
  beginButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F6F3ED',
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { colors, radii } from '../../shared/theme/placeholder-theme';
import { AIRPLANE_INTRO_IMAGE } from '../../shared/assets/milestone-images';
import { useRouteContent } from '../../shared/content/RouteContentContext';
import { APP_STRINGS } from '../../shared/content/strings';

interface AirplaneIntroScreenProps {
  onComplete: () => void;
}

export function AirplaneIntroScreen({ onComplete }: AirplaneIntroScreenProps): React.JSX.Element {
  const routeContent = useRouteContent();
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [textFadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // Fade in background
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    // Fade in text after background
    const textTimer = setTimeout(() => {
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    }, 1500);

    // Auto-advance after 8 seconds
    const autoTimer = setTimeout(() => {
      onComplete();
    }, 8000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(autoTimer);
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Video placeholder — swap with expo-av Video component when content is ready */}
      <View style={styles.videoPlaceholder}>
        {AIRPLANE_INTRO_IMAGE ? (
          <Image source={AIRPLANE_INTRO_IMAGE} style={styles.backgroundImage} resizeMode="cover" />
        ) : null}
        <View style={styles.gradient} />
      </View>

      {/* Guide overlay text */}
      <Animated.View style={[styles.textOverlay, { opacity: textFadeAnim }]}>
        <Text style={styles.routeLabel}>{routeContent.intro.routeLabel}</Text>
        <Text style={styles.pembaText}>
          {routeContent.intro.guideWelcome}
        </Text>
        <Text style={styles.pembaName}>{routeContent.guide.attribution}</Text>
      </Animated.View>

      {/* Skip button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={onComplete}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>{APP_STRINGS.intro.skip}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  videoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    backgroundColor: colors.overlayDark,
  },
  textOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 32,
    paddingBottom: 120,
  },
  routeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.sage,
    letterSpacing: 3,
    marginBottom: 16,
  },
  pembaText: {
    fontSize: 24,
    fontWeight: '600',
    fontStyle: 'italic',
    color: colors.background,
    lineHeight: 36,
    marginBottom: 12,
  },
  pembaName: {
    fontSize: 14,
    color: colors.sage,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.xl,
    backgroundColor: colors.overlayGlass,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
});

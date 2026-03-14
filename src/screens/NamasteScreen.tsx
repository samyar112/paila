import { useEffect, useRef } from 'react';
import { Animated, ImageBackground, StyleSheet, View } from 'react-native';
import { colors } from '../shared/theme/placeholder-theme';

const SUMMIT_IMAGE = require('../../assets/images/milestones/the-summit.jpg');
const DISPLAY_DURATION = 2800;
const FADE_IN_DURATION = 800;
const FADE_OUT_DURATION = 600;

export function NamasteScreen({ onComplete }: { onComplete: () => void }) {
  const namasteOpacity = useRef(new Animated.Value(0)).current;
  const devanagariOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // "Namaste" fades in
      Animated.timing(namasteOpacity, {
        toValue: 1,
        duration: FADE_IN_DURATION,
        useNativeDriver: true,
      }),
      // "नमस्ते" fades in shortly after
      Animated.timing(devanagariOpacity, {
        toValue: 1,
        duration: FADE_IN_DURATION,
        useNativeDriver: true,
      }),
      // Hold
      Animated.delay(DISPLAY_DURATION - FADE_IN_DURATION * 2),
      // Whole screen fades out
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: FADE_OUT_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <ImageBackground
        source={SUMMIT_IMAGE}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Animated.Text style={[styles.namaste, { opacity: namasteOpacity }]}>
            Namaste
          </Animated.Text>
          <Animated.Text style={[styles.devanagari, { opacity: devanagariOpacity }]}>
            नमस्ते
          </Animated.Text>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  namaste: {
    fontSize: 52,
    fontWeight: '300',
    letterSpacing: 3,
    color: colors.background,
  },
  devanagari: {
    marginTop: 8,
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: 2,
    color: colors.background,
    opacity: 0.9,
  },
});

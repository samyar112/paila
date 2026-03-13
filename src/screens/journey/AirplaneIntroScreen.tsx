import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface AirplaneIntroScreenProps {
  onComplete: () => void;
}

export function AirplaneIntroScreen({ onComplete }: AirplaneIntroScreenProps): React.JSX.Element {
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
        <View style={styles.gradient} />
      </View>

      {/* Pemba overlay text */}
      <Animated.View style={[styles.textOverlay, { opacity: textFadeAnim }]}>
        <Text style={styles.routeLabel}>KATHMANDU → LUKLA</Text>
        <Text style={styles.pembaText}>
          "Welcome. The mountain has been waiting for you."
        </Text>
        <Text style={styles.pembaName}>— Pemba Dorje Sherpa</Text>
      </Animated.View>

      {/* Skip button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={onComplete}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2A43',
  },
  videoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F2A43',
  },
  gradient: {
    flex: 1,
    backgroundColor: 'rgba(15, 42, 67, 0.7)',
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
    color: '#C4B89B',
    letterSpacing: 3,
    marginBottom: 16,
  },
  pembaText: {
    fontSize: 24,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#F6F3ED',
    lineHeight: 36,
    marginBottom: 12,
  },
  pembaName: {
    fontSize: 14,
    color: '#C4B89B',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F6F3ED',
  },
});

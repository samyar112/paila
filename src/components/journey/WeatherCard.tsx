import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../shared/theme/placeholder-theme';
import type { WeatherData } from '../../services/weather/WeatherService';

interface WeatherCardProps {
  weather: WeatherData | null;
  isLoading?: boolean;
}

export function WeatherCard({ weather, isLoading }: WeatherCardProps): React.JSX.Element {
  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.loadingText}>Checking weather...</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.card}>
        <Text style={styles.unavailableText}>Weather unavailable</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.tempContainer}>
          <Text style={styles.temperature}>{Math.round(weather.temperatureCelsius)}°</Text>
          <Text style={styles.condition}>{weather.conditionLabel}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.locationName}>{weather.locationName}</Text>
          <Text style={styles.wind}>Wind: {Math.round(weather.windSpeedKmh)} km/h</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempContainer: {
    marginRight: 16,
  },
  temperature: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
  },
  condition: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailsContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  wind: {
    fontSize: 13,
    color: colors.mutedText,
  },
  loadingText: {
    fontSize: 14,
    color: colors.sage,
    textAlign: 'center',
  },
  unavailableText: {
    fontSize: 14,
    color: colors.sage,
    textAlign: 'center',
  },
});

import { appStorage } from '../../shared/storage/app-storage';
import { getLocalDateString } from '../../utils/dates';

export interface WeatherData {
  temperatureCelsius: number;
  conditionLabel: string;
  windSpeedKmh: number;
  iconKey: string;
  locationName: string;
  fetchedAt: string;
}

interface CachedWeather {
  data: WeatherData;
  expiresAt: string;
}

const WEATHER_CACHE_PREFIX = 'weather:';
const WEATHER_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_DAILY_CALLS = 4;
const DAILY_CALL_COUNT_KEY = 'weather:daily_count';

export class WeatherService {
  static getFromCache(lat: number, lon: number): WeatherData | null {
    const key = `${WEATHER_CACHE_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const raw = appStorage.getString(key);
    if (!raw) return null;

    try {
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed !== 'object' || parsed === null ||
        !('data' in parsed) || !('expiresAt' in parsed)
      ) {
        appStorage.remove(key);
        return null;
      }
      const cached = parsed as CachedWeather;
      if (new Date(cached.expiresAt).getTime() < Date.now()) {
        appStorage.remove(key);
        return null;
      }
      return cached.data;
    } catch {
      return null;
    }
  }

  static writeToCache(lat: number, lon: number, data: WeatherData): void {
    const key = `${WEATHER_CACHE_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached: CachedWeather = {
      data,
      expiresAt: new Date(Date.now() + WEATHER_TTL_MS).toISOString(),
    };
    appStorage.set(key, JSON.stringify(cached));
  }

  static getDailyCallCount(): number {
    const today = getLocalDateString();
    const raw = appStorage.getString(`${DAILY_CALL_COUNT_KEY}:${today}`);
    return raw ? parseInt(raw, 10) : 0;
  }

  static incrementDailyCallCount(): void {
    const today = getLocalDateString();
    const key = `${DAILY_CALL_COUNT_KEY}:${today}`;
    const current = this.getDailyCallCount();
    appStorage.set(key, String(current + 1));
  }

  static isRateLimited(): boolean {
    return this.getDailyCallCount() >= MAX_DAILY_CALLS;
  }

  static mapConditionToIcon(condition: string): string {
    const lower = condition.toLowerCase();
    if (lower.includes('snow')) return 'weather-snow';
    if (lower.includes('rain')) return 'weather-rain';
    if (lower.includes('cloud')) return 'weather-cloudy';
    if (lower.includes('fog') || lower.includes('mist')) return 'weather-fog';
    if (lower.includes('wind')) return 'weather-wind';
    if (lower.includes('clear') || lower.includes('sun')) return 'weather-clear';
    return 'weather-cloudy';
  }

  static buildWeatherData(
    payload: Record<string, unknown>,
    locationName: string,
  ): WeatherData {
    const condition = typeof payload['condition'] === 'string'
      ? payload['condition']
      : 'Unknown';
    return {
      temperatureCelsius: typeof payload['temperature'] === 'number'
        ? payload['temperature']
        : 0,
      conditionLabel: condition,
      windSpeedKmh: typeof payload['windSpeed'] === 'number'
        ? payload['windSpeed']
        : 0,
      iconKey: this.mapConditionToIcon(condition),
      locationName,
      fetchedAt: new Date().toISOString(),
    };
  }
}

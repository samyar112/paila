import { WeatherService } from '../src/services/weather/WeatherService';
import { appStorage } from '../src/shared/storage/app-storage';

beforeEach(() => {
  appStorage.clearAll();
});

describe('WeatherService', () => {
  describe('getFromCache', () => {
    it('returns null when no cache', () => {
      expect(WeatherService.getFromCache(27.95, 86.85)).toBeNull();
    });

    it('returns data when cache is fresh', () => {
      const data = {
        temperatureCelsius: -10,
        conditionLabel: 'Snow',
        windSpeedKmh: 20,
        iconKey: 'weather-snow',
        locationName: 'Base Camp',
        fetchedAt: new Date().toISOString(),
      };
      WeatherService.writeToCache(27.95, 86.85, data);
      const result = WeatherService.getFromCache(27.95, 86.85);
      expect(result).toEqual(data);
    });

    it('returns null when cache is expired', () => {
      const data = {
        temperatureCelsius: -10,
        conditionLabel: 'Snow',
        windSpeedKmh: 20,
        iconKey: 'weather-snow',
        locationName: 'Base Camp',
        fetchedAt: new Date().toISOString(),
      };
      // Manually write expired cache
      const key = 'weather:27.95_86.85';
      const cached = {
        data,
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      };
      appStorage.set(key, JSON.stringify(cached));

      expect(WeatherService.getFromCache(27.95, 86.85)).toBeNull();
    });
  });

  describe('getDailyCallCount', () => {
    it('returns 0 on fresh day', () => {
      expect(WeatherService.getDailyCallCount()).toBe(0);
    });

    it('increments correctly', () => {
      WeatherService.incrementDailyCallCount();
      WeatherService.incrementDailyCallCount();
      expect(WeatherService.getDailyCallCount()).toBe(2);
    });
  });

  describe('isRateLimited', () => {
    it('returns false when under limit', () => {
      expect(WeatherService.isRateLimited()).toBe(false);
    });

    it('returns true when at limit', () => {
      for (let i = 0; i < 4; i++) {
        WeatherService.incrementDailyCallCount();
      }
      expect(WeatherService.isRateLimited()).toBe(true);
    });
  });

  describe('mapConditionToIcon', () => {
    it('maps snow', () => {
      expect(WeatherService.mapConditionToIcon('Heavy Snow')).toBe('weather-snow');
    });

    it('maps rain', () => {
      expect(WeatherService.mapConditionToIcon('Light Rain')).toBe('weather-rain');
    });

    it('maps cloud', () => {
      expect(WeatherService.mapConditionToIcon('Partly Cloudy')).toBe('weather-cloudy');
    });

    it('maps clear', () => {
      expect(WeatherService.mapConditionToIcon('Clear Sky')).toBe('weather-clear');
    });

    it('maps fog', () => {
      expect(WeatherService.mapConditionToIcon('Dense Fog')).toBe('weather-fog');
    });

    it('defaults to cloudy', () => {
      expect(WeatherService.mapConditionToIcon('Unknown')).toBe('weather-cloudy');
    });
  });

  describe('buildWeatherData', () => {
    it('builds from payload', () => {
      const result = WeatherService.buildWeatherData(
        { temperature: -15, condition: 'Snow', windSpeed: 25 },
        'Everest Base Camp',
      );
      expect(result.temperatureCelsius).toBe(-15);
      expect(result.conditionLabel).toBe('Snow');
      expect(result.windSpeedKmh).toBe(25);
      expect(result.iconKey).toBe('weather-snow');
      expect(result.locationName).toBe('Everest Base Camp');
    });

    it('handles missing fields with defaults', () => {
      const result = WeatherService.buildWeatherData({}, 'Camp 1');
      expect(result.temperatureCelsius).toBe(0);
      expect(result.conditionLabel).toBe('Unknown');
      expect(result.windSpeedKmh).toBe(0);
      expect(result.locationName).toBe('Camp 1');
    });
  });
});

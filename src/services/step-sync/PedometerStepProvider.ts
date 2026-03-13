import { Pedometer } from 'expo-sensors';
import type { StepProvider, StepReading } from './StepProvider';

export class PedometerStepProvider implements StepProvider {
  async isAvailable(): Promise<boolean> {
    return Pedometer.isAvailableAsync();
  }

  async requestPermission(): Promise<boolean> {
    const { status } = await Pedometer.requestPermissionsAsync();
    return status === 'granted';
  }

  async getTodaySteps(): Promise<StepReading | null> {
    const available = await this.isAvailable();
    if (!available) return null;

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    try {
      const result = await Pedometer.getStepCountAsync(startOfDay, now);
      return {
        steps: result.steps,
        source: 'phone_pedometer',
        fetchedAt: now,
      };
    } catch {
      return null;
    }
  }
}

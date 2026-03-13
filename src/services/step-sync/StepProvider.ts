export interface StepReading {
  steps: number;
  source: 'healthkit' | 'health_connect' | 'phone_pedometer';
  fetchedAt: Date;
}

export interface StepProvider {
  isAvailable(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  getTodaySteps(): Promise<StepReading | null>;
}

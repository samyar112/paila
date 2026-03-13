// Type declarations for react-native-health
// These types cover the subset of the API used by Paila.
// Full types ship with the actual package when installed.

declare module 'react-native-health' {
  export interface HealthKitPermissions {
    permissions: {
      read: string[];
      write: string[];
    };
  }

  export interface HealthInputOptions {
    date?: string;
    startDate?: string;
    endDate?: string;
    includeManuallyAdded?: boolean;
  }

  interface StepCountResult {
    value: number;
  }

  type HealthCallback<T> = (err: string | undefined, results: T) => void;

  interface AppleHealthKitStatic {
    Constants: {
      Permissions: {
        StepCount: string;
        [key: string]: string;
      };
    };
    isAvailable(callback: HealthCallback<boolean>): void;
    initHealthKit(
      permissions: HealthKitPermissions,
      callback: (err: string) => void,
    ): void;
    getStepCount(
      options: HealthInputOptions,
      callback: HealthCallback<StepCountResult>,
    ): void;
  }

  const AppleHealthKit: AppleHealthKitStatic;
  export default AppleHealthKit;
}

// Mock for react-native-health (HealthKit)
// Used in tests where the native module is not available.

const AppleHealthKit = {
  Constants: {
    Permissions: {
      StepCount: 'StepCount',
    },
  },
  isAvailable: jest.fn(
    (callback: (err: string | undefined, available: boolean) => void) => {
      callback(undefined, false);
    },
  ),
  initHealthKit: jest.fn((_permissions: unknown, callback: (err: string) => void) => {
    callback('HealthKit not available in test environment');
  }),
  getStepCount: jest.fn(
    (
      _options: unknown,
      callback: (err: string | undefined, results: { value: number }) => void,
    ) => {
      callback('HealthKit not available in test environment', { value: 0 });
    },
  ),
};

export default AppleHealthKit;

// Mock for react-native-health-connect (Health Connect)
// Used in tests where the native module is not available.

export const initialize = jest.fn().mockResolvedValue(false);

export const requestPermission = jest.fn().mockResolvedValue([]);

export const readRecords = jest.fn().mockResolvedValue({ records: [] });

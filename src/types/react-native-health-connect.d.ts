// Type declarations for react-native-health-connect
// These types cover the subset of the API used by Paila.
// Full types ship with the actual package when installed.

declare module 'react-native-health-connect' {
  export interface HealthConnectPermission {
    accessType: 'read' | 'write';
    recordType: string;
  }

  export interface TimeRangeFilter {
    operator: 'between' | 'after' | 'before';
    startTime?: string;
    endTime?: string;
  }

  export interface ReadRecordsOptions {
    timeRangeFilter: TimeRangeFilter;
  }

  export interface StepRecord {
    count: number;
    startTime: string;
    endTime: string;
    [key: string]: unknown;
  }

  export interface ReadRecordsResult {
    records: StepRecord[];
  }

  export function initialize(): Promise<boolean>;

  export function requestPermission(
    permissions: HealthConnectPermission[],
  ): Promise<HealthConnectPermission[]>;

  export function readRecords(
    recordType: string,
    options: ReadRecordsOptions,
  ): Promise<ReadRecordsResult>;
}

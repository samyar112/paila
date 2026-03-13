declare module 'expo-tracking-transparency' {
  export type PermissionStatus = 'granted' | 'denied' | 'undetermined';
  export interface PermissionResponse {
    status: PermissionStatus;
    granted: boolean;
    canAskAgain: boolean;
    expires: 'never';
  }
  export function requestTrackingPermissionsAsync(): Promise<PermissionResponse>;
  export function getTrackingPermissionsAsync(): Promise<PermissionResponse>;
}

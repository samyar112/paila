export const Pedometer = {
  isAvailableAsync: async () => false,
  requestPermissionsAsync: async () => ({ status: 'denied' }),
  getStepCountAsync: async () => ({ steps: 0 }),
};

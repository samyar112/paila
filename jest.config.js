/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  testPathIgnorePatterns: ['<rootDir>/tests/firestore.rules.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    '^react-native$': '<rootDir>/tests/__mocks__/react-native.ts',
    '^react-native-mmkv$': '<rootDir>/tests/__mocks__/react-native-mmkv.ts',
    '^@react-native-firebase/firestore$': '<rootDir>/tests/__mocks__/firebase-firestore.ts',
    '^@react-native-firebase/auth$': '<rootDir>/tests/__mocks__/firebase-auth.ts',
    '^@react-native-firebase/functions$': '<rootDir>/tests/__mocks__/firebase-functions.ts',
    '^expo-sensors$': '<rootDir>/tests/__mocks__/expo-sensors.ts',
  },
};

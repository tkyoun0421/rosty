const mockStorage = new Map();
const mockSecureStorage = new Map();

jest.mock('@react-native-async-storage/async-storage', () => {
  return {
    getItem: jest.fn(async (key) => mockStorage.get(key) ?? null),
    setItem: jest.fn(async (key, value) => {
      mockStorage.set(key, value);
    }),
    removeItem: jest.fn(async (key) => {
      mockStorage.delete(key);
    }),
    clear: jest.fn(async () => {
      mockStorage.clear();
    }),
  };
});

jest.mock('expo-secure-store', () => {
  return {
    getItemAsync: jest.fn(async (key) => mockSecureStorage.get(key) ?? null),
    setItemAsync: jest.fn(async (key, value) => {
      mockSecureStorage.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key) => {
      mockSecureStorage.delete(key);
    }),
  };
});

jest.mock('expo-web-browser', () => {
  return {
    maybeCompleteAuthSession: jest.fn(() => ({ type: 'success' })),
    openAuthSessionAsync: jest.fn(async () => ({ type: 'cancel' })),
  };
});

afterEach(() => {
  mockStorage.clear();
  mockSecureStorage.clear();
});

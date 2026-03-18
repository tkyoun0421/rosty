const mockStorage = new Map();

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

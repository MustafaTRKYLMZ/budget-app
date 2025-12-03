// apps/mobile/utils/storage/zustandStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StateStorage } from "zustand/middleware";

const isServer = typeof window === "undefined";

const createMemoryStorage = (): StateStorage => {
  let store: Record<string, string> = {};

  return {
    getItem: async (name) => store[name] ?? null,
    setItem: async (name, value) => {
      store[name] = value;
    },
    removeItem: async (name) => {
      delete store[name];
    },
  };
};

export const getZustandStorage = (): StateStorage => {
  return isServer ? createMemoryStorage() : AsyncStorage;
};

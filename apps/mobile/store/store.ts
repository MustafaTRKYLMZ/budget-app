// apps/mobile/store/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StateStorage } from "zustand/middleware";


const isServer = typeof window === "undefined";


const createMemoryStorage = (): StateStorage => {
  let store: Record<string, string> = {};

  return {
    getItem: async (name: string) => {
      return store[name] ?? null;
    },
    setItem: async (name: string, value: string) => {
      store[name] = value;
    },
    removeItem: async (name: string) => {
      delete store[name];
    },
  };
};

export const getZustandStorage = (): StateStorage => {
  if (isServer) {
   
    return createMemoryStorage();
  }

 
  return AsyncStorage;
};

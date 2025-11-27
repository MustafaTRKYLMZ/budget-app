// apps/mobile/api.ts
import {
    fetchTransactions as coreFetchTransactions,
    createTransaction as coreCreateTransaction,
    updateTransaction as coreUpdateTransaction,
    deleteTransactionApi as coreDeleteTransaction,
    type ApiConfig,
    type Transaction,
  } from "@budget/core";
  

  
    const API_URL =
    process.env.EXPO_PUBLIC_API_URL || "http://192.168.2.33:3001";
  
  console.log("API_URL (mobile)", API_URL);
  

  const config: ApiConfig = {
    baseUrl: API_URL,
  };
  
  export async function fetchTransactions() {
    return coreFetchTransactions(config);
  }
  
  export async function createTransaction(tx: Transaction) {
    return coreCreateTransaction(config, tx);
  }
  
  export async function updateTransaction(tx: Transaction) {
    return coreUpdateTransaction(config, tx);
  }
  
  export async function deleteTransaction(id: Transaction["id"]) {
    return coreDeleteTransaction(config, id);
  }
  
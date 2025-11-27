// packages/core/src/apiClient.ts
import type { Transaction } from "./types";

export interface ApiConfig {
  baseUrl: string; // örn: http://localhost:3001
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchTransactions(
  config: ApiConfig
): Promise<Transaction[]> {
  const res = await fetch(`${config.baseUrl}/transactions`);
  return handleJson<Transaction[]>(res);
}

export async function createTransaction(
  config: ApiConfig,
  tx: Transaction
): Promise<Transaction> {
  const res = await fetch(`${config.baseUrl}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tx),
  });
  return handleJson<Transaction>(res);
}

export async function updateTransaction(
  config: ApiConfig,
  tx: Transaction
): Promise<Transaction> {
  const res = await fetch(`${config.baseUrl}/transactions/${tx.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tx),
  });
  return handleJson<Transaction>(res);
}

export async function deleteTransactionApi(
  config: ApiConfig,
  id: Transaction["id"]
): Promise<void> {
  const res = await fetch(`${config.baseUrl}/transactions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
}

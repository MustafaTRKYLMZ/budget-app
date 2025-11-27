
import { Transaction } from './types'

export function getTotalAmount(transactions: Transaction[]) {
  return transactions.reduce((sum, t) => sum + t.amount, 0)
}

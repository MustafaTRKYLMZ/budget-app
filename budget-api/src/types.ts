import type { Transaction as CoreTransaction } from "@budget/core";

export type Transaction = CoreTransaction & {
 // we can add more fields here in the future if needed
};

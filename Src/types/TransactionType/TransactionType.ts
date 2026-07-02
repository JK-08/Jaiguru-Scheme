// Src/types/TransactionType/TransactionType.ts
//
// Shape used by Src/Services/TransactionTypeService.js.

export interface TransactionType {
  ACCOUNT: string;
  NAME: string;
}

export type TransactionTypeListResponse = TransactionType[];

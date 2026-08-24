// Src/types/TransactionType/TransactionType.ts
//
// Shape used by Src/Services/TransactionTypeService.js.

export interface TransactionType {
  ACCOUNT: string;
  NAME: string;
  CARDTYPE: string;
}

export type TransactionTypeListResponse = TransactionType[];

/** Resolved payment fields derived from a TransactionType entry */
export interface OnlinePayMode {
  accCode: string;
  modePay: string;
  chqBankCode: number;
}

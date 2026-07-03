// Src/api/services/accountService.ts
import { callApi } from '../apiClient';
import { ACCOUNT } from '../endpoints';
import { Account, AccountListResponse } from '../../types/Account/Account';
import { TransactionTypeListResponse } from '../../types/TransactionType/TransactionType';

export const accountService = {
  /** GET /account/phone_details?phoneNo= — schemes/accounts for a phone number */
  getPhoneDetails: (phoneNo: string) =>
    callApi<null, AccountListResponse>({
      method: 'get',
      url: ACCOUNT.PHONE_DETAILS(phoneNo),
    }),

  /** GET /account/getTranType */
  getTransactionTypes: () =>
    callApi<null, TransactionTypeListResponse>({
      method: 'get',
      url: ACCOUNT.TRANSACTION_TYPES,
    }),
};

export type { Account };

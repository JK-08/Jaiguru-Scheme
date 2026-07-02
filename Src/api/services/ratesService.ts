// Src/api/services/ratesService.ts
import { callApi } from '../apiClient';
import { ACCOUNT } from '../endpoints';
import { Rates } from '../../types/Rates/Rates';

export const ratesService = {
  /** GET /account/todayrate -> { GOLDRATE, SILVERRATE } */
  getTodayRate: () =>
    callApi<null, Rates>({
      method: 'get',
      url: ACCOUNT.TODAY_RATE,
    }),
};

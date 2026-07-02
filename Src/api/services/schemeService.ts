// Src/api/services/schemeService.ts
import { callApi } from '../apiClient';
import { SCHEMES } from '../endpoints';
import { SchemeListResponse, SchemeGroupOptionsResponse } from '../../types/Scheme/Scheme';

export const schemeService = {
  /** GET /member/scheme — full scheme catalog */
  getAll: () =>
    callApi<null, SchemeListResponse>({
      method: 'get',
      url: SCHEMES.ALL,
    }),

  /** GET /member/schemeid?schemeId= — group/amount options for one scheme */
  getGroupOptions: (schemeId: number | string) =>
    callApi<null, SchemeGroupOptionsResponse>({
      method: 'get',
      url: SCHEMES.BY_SCHEME_ID(schemeId),
    }),
};

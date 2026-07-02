// Src/api/services/companyService.ts
import { callApi } from '../apiClient';
import { COMPANY } from '../endpoints';
import { Company, CompanyListResponse } from '../../types/Company/Company';

export const companyService = {
  /** GET /company/all */
  getAll: () =>
    callApi<null, CompanyListResponse>({
      method: 'get',
      url: COMPANY.ALL,
    }),
};

export type { Company };

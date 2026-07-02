// Src/api/services/onboardingService.ts
import { callApi } from '../apiClient';
import { ONBOARDING } from '../endpoints';
import { OnboardBannerResponse } from '../../types/HomeBanner/HomeBanner';

export const onboardingService = {
  /** GET /schemebanner/all */
  getBanners: () =>
    callApi<null, OnboardBannerResponse>({
      method: 'get',
      url: ONBOARDING.BANNERS,
    }),
};

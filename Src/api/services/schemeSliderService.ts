// Src/api/services/schemeSliderService.ts
import { callApi } from '../apiClient';
import { SCHEME_SLIDER } from '../endpoints';
import { SchemeSliderResponse } from '../../types/HomeBanner/HomeBanner';

export const schemeSliderService = {
  /** GET /schemeslider/all */
  getSliders: () =>
    callApi<null, SchemeSliderResponse>({
      method: 'get',
      url: SCHEME_SLIDER.ALL,
    }),
};

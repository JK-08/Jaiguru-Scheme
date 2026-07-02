// Src/api/hooks/Onboard/useOnboardingBanners.ts
import { useState, useEffect } from 'react';
import { onboardingService } from '../../services/onboardingService';
import { OnboardBanner } from '../../../types/HomeBanner/HomeBanner';

export const useOnboardBanners = () => {
  const [banners, setBanners] = useState<OnboardBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingService.getBanners();
      setBanners(res.banners ?? []);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  return { banners, loading, error, refresh: loadBanners };
};

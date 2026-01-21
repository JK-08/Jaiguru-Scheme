import { useEffect, useState } from 'react';
import { fetchOnboardBanners } from '../Services/OnboardService';

export const useOnboardBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBanners = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchOnboardBanners();
      setBanners(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  return {
    banners,
    loading,
    error,
    refresh: loadBanners,
  };
};

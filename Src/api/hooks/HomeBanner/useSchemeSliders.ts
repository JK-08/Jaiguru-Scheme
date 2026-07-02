// Src/api/hooks/HomeBanner/useSchemeSliders.ts
import { useEffect, useState } from 'react';
import { schemeSliderService } from '../../services/schemeSliderService';
import { SchemeSlider } from '../../../types/HomeBanner/HomeBanner';

export function useSchemeSliders() {
  const [sliders, setSliders] = useState<SchemeSlider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await schemeSliderService.getSliders();
        if (!cancelled) setSliders(res.sliders ?? []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load sliders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { sliders, loading, error };
}

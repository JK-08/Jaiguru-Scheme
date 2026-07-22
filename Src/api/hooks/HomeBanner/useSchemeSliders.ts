// Src/api/hooks/HomeBanner/useSchemeSliders.ts
import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { schemeSliderService } from '../../services/schemeSliderService';
import { SchemeSlider } from '../../../types/HomeBanner/HomeBanner';
import { IMAGE_BASE_URL } from '../../../Config/BaseUrl';

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
        if (cancelled) return;
        const list = res.sliders ?? [];
        // Prefetch all images in parallel so they're cached before render
        await Promise.all(
          list.map((s) => Image.prefetch(`${IMAGE_BASE_URL}${s.image_path}`).catch(() => {}))
        );
        if (!cancelled) setSliders(list);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load sliders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { sliders, loading, error };
}

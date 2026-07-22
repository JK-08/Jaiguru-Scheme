// Src/api/hooks/Schemes/useSchemeCatalog.ts
import { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { schemeService } from '../../services/schemeService';
import { Scheme } from '../../../types/Scheme/Scheme';
import { IMAGE_BASE_URL } from '../../../Config/BaseUrl';

export const useSchemeCatalog = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSchemes = async () => {
      try {
        setLoading(true);
        const data: any[] = await schemeService.getAll() || [];
        await Promise.all(
          data
            .filter((s) => s.image_path)
            .map((s) => Image.prefetch(`${IMAGE_BASE_URL}${s.image_path}`).catch(() => {}))
        );
        setSchemes(data);
      } catch (err: any) {
        setError(err?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    getSchemes();
  }, []);

  return { schemes, loading, error };
};

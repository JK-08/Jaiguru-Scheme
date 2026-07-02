// Src/api/hooks/Schemes/useSchemeCatalog.ts
//
// Ported from Src/Hooks/useScheme.js. Renamed from the original
// `useSchemes` — Src/Hooks/useScheme.js and Src/Hooks/useSchemeAmount.js
// both exported a differently-shaped hook named `useSchemes`, which was a
// real naming collision risk (flagged in the earlier app audit). This one
// is the full scheme catalog (no args); see useSchemeGroupOptions.ts for
// the per-scheme amount-options hook that used to share the same name.
import { useState, useEffect } from 'react';
import { schemeService } from '../../services/schemeService';
import { Scheme } from '../../../types/Scheme/Scheme';

export const useSchemeCatalog = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSchemes = async () => {
      try {
        setLoading(true);
        const data = await schemeService.getAll();
        setSchemes(data || []);
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

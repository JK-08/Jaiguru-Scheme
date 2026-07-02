// Src/api/hooks/Rates/useTodayRate.ts
import { useEffect, useState } from 'react';
import { ratesService } from '../../services/ratesService';
import { Rates } from '../../../types/Rates/Rates';

export function useTodayRate() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ratesService.getTodayRate();
        if (!cancelled) setRates(data);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to fetch rates');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { rates, loading, error };
}

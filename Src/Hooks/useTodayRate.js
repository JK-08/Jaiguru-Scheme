import { useEffect, useState } from "react";
import { fetchTodayRate } from "../Services/TodayRateService";

export function useTodayRate() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRates() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchTodayRate({
          signal: controller.signal,
        });

        setRates(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to fetch rates");
        }
      } finally {
        setLoading(false);
      }
    }

    loadRates();

    return () => controller.abort();
  }, []);

  return { rates, loading, error };
}

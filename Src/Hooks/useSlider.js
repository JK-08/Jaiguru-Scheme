import { useEffect, useState } from "react";
import { fetchSchemeSliders } from "../Services/SliderService";

export function useSchemeSliders() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSliders() {
      try {
        setLoading(true);
        setError(null);

        const sliderData = await fetchSchemeSliders({
          signal: controller.signal,
        });

        setSliders(sliderData);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load sliders");
        }
      } finally {
        setLoading(false);
      }
    }

    loadSliders();

    return () => controller.abort();
  }, []);

  return { sliders, loading, error };
}

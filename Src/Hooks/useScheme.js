// hooks/useSchemes.js
import { useState, useEffect } from "react";
import { fetchSchemes } from "../Services/SchemeNameService";

export const useSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSchemes = async () => {
      try {
        setLoading(true);
        const data = await fetchSchemes();
        setSchemes(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    getSchemes();
  }, []);

  return { schemes, loading, error };
};

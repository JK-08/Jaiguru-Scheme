import { useEffect, useState } from "react";
import { getCompanyDetails } from "../Services/CompanyDetailsService";
import { API_BASE_URL } from "../Config/BaseUrl";

export const useCompany = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await getCompanyDetails();

        if (Array.isArray(data) && data.length > 0) {
          const rawCompany = data[0];

          // Trim only string values
          const cleanedCompany = Object.keys(rawCompany).reduce((acc, key) => {
            acc[key] =
              typeof rawCompany[key] === "string"
                ? rawCompany[key].trim()
                : rawCompany[key];
            return acc;
          }, {});

          // ✅ Full image URL
          const logoUrl = cleanedCompany.CompanyLogo
            ? `${API_BASE_URL}${cleanedCompany.CompanyLogo}`
            : null;

          console.log("Company Logo URL:", logoUrl);

          setCompany({
            ...cleanedCompany,
            CompanyLogoUrl: logoUrl,
          });
        } else {
          setError("No company data found");
        }
      } catch (err) {
        console.error("Error fetching company:", err);
        setError(err.message || "Failed to fetch company details");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  return { company, loading, error };
};

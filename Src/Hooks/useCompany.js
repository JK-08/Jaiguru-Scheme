import { useEffect, useState } from "react";
import { getCompanyDetails } from "../Services/CompanyDetailsService";
import { API_BASE_URL, IMAGE_BASE_URL } from "../Config/BaseUrl";

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
            const value = rawCompany[key];
            if (value === null || value === undefined) {
              acc[key] = value;
            } else if (typeof value === "string") {
              acc[key] = value.trim();
            } else {
              acc[key] = value;
            }
            return acc;
          }, {});


          // Determine the logo URL - Try multiple sources in order
          let logoUrl = null;
          
          // First priority: Use CompanyLogoUrl if it's already a complete URL
          if (cleanedCompany.CompanyLogoUrl && cleanedCompany.CompanyLogoUrl.startsWith('http')) {
            logoUrl = cleanedCompany.CompanyLogoUrl;
            console.log("Using CompanyLogoUrl from API:", logoUrl);
          }
          // Second priority: Check if LOGO field contains a full URL
          else if (cleanedCompany.LOGO && cleanedCompany.LOGO.startsWith('http')) {
            logoUrl = cleanedCompany.LOGO;
            console.log("Using LOGO field as full URL:", logoUrl);
          }
          // Third priority: Construct URL using BASEURL from company data
          else if (cleanedCompany.BASEURL && cleanedCompany.LOGO) {
            const logoPath = cleanedCompany.LOGO;
            // Ensure proper URL construction
            const baseUrl = cleanedCompany.BASEURL.endsWith('/') 
              ? cleanedCompany.BASEURL.slice(0, -1) 
              : cleanedCompany.BASEURL;
            
            const path = logoPath.startsWith('/') 
              ? logoPath 
              : `/${logoPath}`;
            
            logoUrl = `${baseUrl}${path}`;
            console.log("Constructed URL from BASEURL + LOGO:", logoUrl);
          }
          // Fourth priority: Use IMAGE_BASE_URL + LOGO path
          else if (cleanedCompany.LOGO) {
            const logoPath = cleanedCompany.LOGO;
            const path = logoPath.startsWith('/') 
              ? logoPath 
              : `/${logoPath}`;
            
            logoUrl = `${IMAGE_BASE_URL}${path}`;
            console.log("Constructed URL from IMAGE_BASE_URL + LOGO:", logoUrl);
          }
          // Last resort: Use API_BASE_URL
          else {
            logoUrl = `${API_BASE_URL}/uploads/companyLogo/default-logo.png`;
            console.log("Using default logo URL:", logoUrl);
          }

          // Set the company state with the logo URL
          setCompany({
            ...cleanedCompany,
            CompanyLogoUrl: logoUrl,
          });
          
        } else {
          console.error("No company data found in response");
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
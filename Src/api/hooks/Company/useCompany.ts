// Src/api/hooks/Company/useCompany.ts
import { useEffect, useState } from 'react';
import { companyService } from '../../services/companyService';
import { Company } from '../../../types/Company/Company';
import { API_BASE_URL, IMAGE_BASE_URL } from '../../../Config/BaseUrl';

/** Same logo-URL resolution priority as the original Src/Hooks/useCompany.js */
const resolveLogoUrl = (c: Company): string => {
  if (c.CompanyLogoUrl?.startsWith('http')) return c.CompanyLogoUrl;
  if (c.LOGO?.startsWith('http')) return c.LOGO;
  if (c.BASEURL && c.LOGO) {
    const base = c.BASEURL.endsWith('/') ? c.BASEURL.slice(0, -1) : c.BASEURL;
    const path = c.LOGO.startsWith('/') ? c.LOGO : `/${c.LOGO}`;
    return `${base}${path}`;
  }
  if (c.LOGO) {
    const path = c.LOGO.startsWith('/') ? c.LOGO : `/${c.LOGO}`;
    return `${IMAGE_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/uploads/companyLogo/default-logo.png`;
};

const trimStrings = (obj: Company): Company =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  ) as Company;

export const useCompany = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await companyService.getAll();
        if (Array.isArray(data) && data.length > 0) {
          const cleaned = trimStrings(data[0]);
          setCompany({ ...cleaned, CompanyLogoUrl: resolveLogoUrl(cleaned) });
        } else {
          setError('No company data found');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch company details');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  return { company, loading, error };
};

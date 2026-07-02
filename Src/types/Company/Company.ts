// Src/types/Company/Company.ts
//
// Shape of an item returned by GET /company/all. Field names match the raw
// API response exactly (see Src/Screens/HelpCenter/HelpCenter.js, which
// currently consumes these fields directly).

export interface Company {
  COMPANYID?: string;
  COMPANYNAME?: string;
  COSTID?: string;
  ACTIVE?: string; // 'Y' | 'N'

  ADDRESS1?: string;
  ADDRESS2?: string;
  ADDRESS3?: string;
  ADDRESS4?: string;
  AREACODE?: string;

  PHONE?: string;
  EMAIL?: string;
  BASEURL?: string;

  GSTNO?: string;
  PANNO?: string;
  TINNO?: string;
  TANNO?: string;
  TDSNO?: string;
  CSTNO?: string;
  LOCALTAXNO?: string;

  LOGO?: string;
  CompanyLogoUrl?: string;

  FACEBOOKLINK?: string;
  TWITTERLINK?: string;
  INSTALINK?: string;
  YOUTUBELINK?: string;
  WHATSAPPLINK?: string;
  ANDROIDLINK?: string;
  APPSTORELINK?: string;
  GOOGLEBUSINESSLINK?: string;
}

export type CompanyListResponse = Company[];

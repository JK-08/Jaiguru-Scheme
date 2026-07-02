// Src/types/Member/Member.ts
//
// Request/response shapes for POST /member/create, matching the payload
// built in Src/Screens/MemberCreation/MemberCreation.js.

export interface NewMemberPayload {
  title?: string;
  initial?: string;
  pName: string;
  sName?: string;
  doorNo?: string;
  address1?: string;
  address2?: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  mobile: string;
  mobile2?: string;
  nomeni?: string;
  nomineeMobile?: string;
  nomineeRelationship?: string;
  nomAddr1?: string;
  nomAddr2?: string;
  nomCity?: string;
  nomState?: string;
  nomPincode?: string;
  nomCountry?: string;
  idProof?: string;
  idProofNo?: string;
  aadhaarMasked?: string;
  panNumber?: string;
  dob?: string | null;
  email?: string;
  mobileVerified?: boolean;
  aadhaarVerified?: boolean;
  nomineeMobileVerified?: boolean;
  nomineeAadhaarVerified?: boolean;
  upDateTime?: string;
  userId?: string | number;
  appVer?: string;
  anniversaryDate?: string | null;
}

export interface CreateSchemeSummaryPayload {
  schemeId: number;
  groupCode: string;
  regNo: number;
  joinDate: string;
  upDateTime2: string;
  openingDate: string;
  userId2?: string | number;
}

export interface SchemeCollectInsertPayload {
  amount: number;
  modePay: number;
  accCode: string;
  chqBankCode: number;
  chqCardNo?: string;
  chqBranch?: string;
  chkBank?: string;
  chqRtnReason?: string;
}

export interface CreateMemberPayload {
  newMember: NewMemberPayload;
  createSchemeSummary: CreateSchemeSummaryPayload;
  schemeCollectInsert: SchemeCollectInsertPayload;
  referralCode?: string;
}

export interface CreateMemberResponse {
  message?: string;
  [key: string]: unknown;
}

// Src/types/Mpin/Mpin.ts
//
// Shapes used by Src/Services/MpinService.js.

export interface MpinApiResponse {
  message?: string;
  [key: string]: unknown;
}

export interface MpinApiError {
  message: string;
  status?: number;
  code?: 'MPIN_NOT_FOUND' | string;
}

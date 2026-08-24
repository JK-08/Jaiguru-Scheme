// Src/constants/paymentConstants.ts
// Single source of truth for all fixed payment/member payload values
// used across MemberCreation and PayNow screens.

export const PAYMENT_CONSTANTS = {
  // Member defaults
  TITLE: 'Mr',
  INITIAL_FALLBACK: 'K',
  DEFAULT_STATE: 'Tamil Nadu',
  DEFAULT_COUNTRY: 'India',
  ID_PROOF: 'Aadhaar',
  APP_VER: 'WEB',

  // Payment payload
  USER_ID: 999,
  CHQ_BRANCH: 'Online',
  CHK_BANK: 'Razorpay',

  // PayNow fallbacks (when personalInfo is missing)
  FALLBACK_PHONE: '9999999999',
  FALLBACK_EMAIL: 'customer@example.com',
};

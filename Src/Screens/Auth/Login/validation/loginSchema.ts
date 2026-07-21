// Src/Screens/Auth/Login/validation/loginSchema.ts
// -----------------------------------------------------------------------------
// Dependency-free, Zod-style typed validation for the login form.
// (Zod isn't installed in this project; this mirrors its shape/ergonomics so it
//  can be swapped for a real Zod schema later with minimal changes.)
// -----------------------------------------------------------------------------

export interface LoginValues {
  mobile: string;
  password: string;
}

export type LoginErrors = Partial<Record<keyof LoginValues, string>>;

export interface LoginValidationResult {
  success: boolean;
  errors: LoginErrors;
}

// Indian mobile numbers: 10 digits starting 6–9.
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const MIN_PASSWORD = 6;

/** Validate a single field; returns an error message or `undefined`. */
export function validateField<K extends keyof LoginValues>(
  field: K,
  value: string,
): string | undefined {
  const v = value.trim();

  switch (field) {
    case 'mobile':
      if (!v) return 'Please enter your mobile number';
      if (!MOBILE_REGEX.test(v)) return 'Enter a valid 10-digit mobile number';
      return undefined;

    case 'password':
      if (!v) return 'Please enter your password';
      if (v.length < MIN_PASSWORD) return `Password must be at least ${MIN_PASSWORD} characters`;
      return undefined;

    default:
      return undefined;
  }
}

/** Validate the whole form. */
export function validateLogin(values: LoginValues): LoginValidationResult {
  const errors: LoginErrors = {};

  const mobileError = validateField('mobile', values.mobile);
  if (mobileError) errors.mobile = mobileError;

  const passwordError = validateField('password', values.password);
  if (passwordError) errors.password = passwordError;

  return { success: Object.keys(errors).length === 0, errors };
}

export const LOGIN_CONSTRAINTS = {
  mobileLength: 10,
  minPassword: MIN_PASSWORD,
} as const;

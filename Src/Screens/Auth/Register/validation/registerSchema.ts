// Src/Screens/Auth/Register/validation/registerSchema.ts
// -----------------------------------------------------------------------------
// Zod schema + shared password-rule checker for the Register screen.
// -----------------------------------------------------------------------------

import { z } from 'zod';

// Individual password rules — reused by the schema AND the live strength meter
// so the two never drift apart.
export interface PasswordRule {
  readonly key: string;
  readonly label: string;
  readonly test: (v: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  { key: 'length', label: 'At least 6 characters', test: (v) => v.length >= 6 },
  { key: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { key: 'number', label: 'One number', test: (v) => /\d/.test(v) },
  { key: 'special', label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

/** How many password rules the given value satisfies (0–5). */
export const passwordScore = (v: string): number =>
  PASSWORD_RULES.reduce((n, r) => n + (r.test(v) ? 1 : 0), 0);

const mobileRegex = /^[6-9]\d{9}$/;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Please enter your full name (min 3 characters)')
      .max(50, 'Name is too long'),

    mobile: z
      .string()
      .trim()
      .regex(mobileRegex, 'Enter a valid 10-digit mobile number'),

    email: z.string().trim().email('Enter a valid email address'),

    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
      // .regex(/[A-Z]/, 'Add one uppercase letter')
      // .regex(/[a-z]/, 'Add one lowercase letter')
      // .regex(/\d/, 'Add one number')
      // .regex(/[^A-Za-z0-9]/, 'Add one special character'),

    confirmPassword: z.string().min(1, 'Please confirm your password'),

    referralCode: z.string().trim().optional(),

    terms: z.boolean().refine((v) => v === true, {
      message: 'Please accept the Terms & Conditions to continue',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const REGISTER_DEFAULTS: RegisterFormValues = {
  name: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
  referralCode: '',
  terms: false,
};

import { useMemo } from 'react';

interface PasswordChecks {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

interface PasswordStrength {
  level: 'weak' | 'medium' | 'strong';
  color: string;
  width: string;
}

interface UsePasswordValidationResult {
  passwordChecks: PasswordChecks;
  passwordStrength: PasswordStrength;
  passwordsMatch: boolean;
  isValid: boolean;
}

export const usePasswordValidation = (
  password: string,
  confirmPassword: string = ''
): UsePasswordValidationResult => {
  const passwordChecks = useMemo<PasswordChecks>(
    () => ({
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }),
    [password]
  );

  const passwordStrength = useMemo<PasswordStrength>(() => {
    const checks = Object.values(passwordChecks);
    const passed = checks.filter(Boolean).length;
    if (passed <= 2) return { level: 'weak', color: '#ef4444', width: '33%' };
    if (passed <= 4) return { level: 'medium', color: '#f59e0b', width: '66%' };
    return { level: 'strong', color: '#10b981', width: '100%' };
  }, [passwordChecks]);

  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  const isValid =
    passwordChecks.minLength &&
    passwordChecks.hasLowercase &&
    passwordChecks.hasUppercase &&
    passwordChecks.hasNumber;

  return { passwordChecks, passwordStrength, passwordsMatch, isValid };
};

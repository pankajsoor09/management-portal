import React from 'react';
import './PasswordRequirements.css';

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

interface PasswordRequirementsProps {
  password: string;
  confirmPassword?: string;
  passwordChecks: PasswordChecks;
  passwordStrength: PasswordStrength;
  passwordsMatch?: boolean;
  showRequirements?: boolean;
  showStrength?: boolean;
  showMatch?: boolean;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  confirmPassword = '',
  passwordChecks,
  passwordStrength,
  passwordsMatch = false,
  showRequirements = true,
  showStrength = true,
  showMatch = true,
}) => {
  return (
    <>
      {showStrength && password && (
        <div className="password-strength">
          <div className="strength-bar">
            <div
              className="strength-fill"
              style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
            />
          </div>
          <span className="strength-text" style={{ color: passwordStrength.color }}>
            {passwordStrength.level}
          </span>
        </div>
      )}

      {showRequirements && password && (
        <ul className="password-requirements">
          <li className={passwordChecks.minLength ? 'valid' : 'invalid'}>
            {passwordChecks.minLength ? '\u2713' : '\u25CB'} At least 8 characters
          </li>
          <li className={passwordChecks.hasUppercase ? 'valid' : 'invalid'}>
            {passwordChecks.hasUppercase ? '\u2713' : '\u25CB'} One uppercase letter
          </li>
          <li className={passwordChecks.hasLowercase ? 'valid' : 'invalid'}>
            {passwordChecks.hasLowercase ? '\u2713' : '\u25CB'} One lowercase letter
          </li>
          <li className={passwordChecks.hasNumber ? 'valid' : 'invalid'}>
            {passwordChecks.hasNumber ? '\u2713' : '\u25CB'} One number
          </li>
          <li className={passwordChecks.hasSpecial ? 'valid' : 'invalid'}>
            {passwordChecks.hasSpecial ? '\u2713' : '\u25CB'} One special character (optional)
          </li>
        </ul>
      )}

      {showMatch && confirmPassword && (
        <div className={`password-match ${passwordsMatch ? 'match' : 'no-match'}`}>
          {passwordsMatch ? '\u2713 Passwords match' : '\u2715 Passwords do not match'}
        </div>
      )}
    </>
  );
};

export default PasswordRequirements;

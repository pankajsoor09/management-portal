import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';
import './Auth.css';

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const passwordChecks = useMemo(() => ({
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password]);

  const passwordStrength = useMemo(() => {
    const checks = Object.values(passwordChecks);
    const passed = checks.filter(Boolean).length;
    if (passed <= 2) return { level: 'weak', color: '#ef4444', width: '33%' };
    if (passed <= 4) return { level: 'medium', color: '#f59e0b', width: '66%' };
    return { level: 'strong', color: '#10b981', width: '100%' };
  }, [passwordChecks]);

  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!passwordChecks.minLength || !passwordChecks.hasLowercase ||
               !passwordChecks.hasUppercase || !passwordChecks.hasNumber) {
      newErrors.password = 'Password does not meet requirements';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await signup(email, password, fullName);
      showToast('Account created successfully. Please login.', 'success');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Signup failed';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const showPasswordRequirements = passwordFocused || (password && !passwordChecks.minLength ||
    !passwordChecks.hasLowercase || !passwordChecks.hasUppercase || !passwordChecks.hasNumber);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Sign up to get started</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => handleBlur('fullName')}
            error={touched.fullName && !fullName.trim() ? 'Full name is required' : errors.fullName}
            placeholder="Enter your full name"
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            error={touched.email && !email ? 'Email is required' : errors.email}
            placeholder="Enter your email"
            autoComplete="email"
          />

          <div className="password-section">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => {
                setPasswordFocused(false);
                handleBlur('password');
              }}
              error={errors.password}
              placeholder="Create a password"
              autoComplete="new-password"
            />

            {password && (
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

            {showPasswordRequirements && (
              <ul className="password-requirements">
                <li className={passwordChecks.minLength ? 'valid' : 'invalid'}>
                  {passwordChecks.minLength ? '✓' : '○'} At least 8 characters
                </li>
                <li className={passwordChecks.hasUppercase ? 'valid' : 'invalid'}>
                  {passwordChecks.hasUppercase ? '✓' : '○'} One uppercase letter
                </li>
                <li className={passwordChecks.hasLowercase ? 'valid' : 'invalid'}>
                  {passwordChecks.hasLowercase ? '✓' : '○'} One lowercase letter
                </li>
                <li className={passwordChecks.hasNumber ? 'valid' : 'invalid'}>
                  {passwordChecks.hasNumber ? '✓' : '○'} One number
                </li>
                <li className={passwordChecks.hasSpecial ? 'valid' : 'invalid'}>
                  {passwordChecks.hasSpecial ? '✓' : '○'} One special character (optional)
                </li>
              </ul>
            )}
          </div>

          <div className="confirm-password-section">
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
            {confirmPassword && (
              <div className={`password-match ${passwordsMatch ? 'match' : 'no-match'}`}>
                {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
              </div>
            )}
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

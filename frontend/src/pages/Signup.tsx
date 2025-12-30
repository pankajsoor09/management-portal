import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePasswordValidation } from '../hooks/usePasswordValidation';
import Input from '../components/Input';
import Button from '../components/Button';
import PasswordRequirements from '../components/PasswordRequirements';
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

  const { passwordChecks, passwordStrength, passwordsMatch, isValid } = usePasswordValidation(
    password,
    confirmPassword
  );

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
    } else if (!isValid) {
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

  const showPasswordRequirements = passwordFocused || (!!password && !isValid);

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
            <PasswordRequirements
              password={password}
              passwordChecks={passwordChecks}
              passwordStrength={passwordStrength}
              showRequirements={showPasswordRequirements}
              showMatch={false}
            />
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
            <PasswordRequirements
              password={password}
              confirmPassword={confirmPassword}
              passwordChecks={passwordChecks}
              passwordStrength={passwordStrength}
              passwordsMatch={passwordsMatch}
              showStrength={false}
              showRequirements={false}
              showMatch={true}
            />
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

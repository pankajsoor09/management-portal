import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [originalData, setOriginalData] = useState({ fullName: '', email: '' });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        const userData = response.data.data.user;
        setFullName(userData.fullName);
        setEmail(userData.email);
        setOriginalData({ fullName: userData.fullName, email: userData.email });
      } catch (error: any) {
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showToast]);

  const validateProfile = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfile()) return;

    setProfileLoading(true);
    try {
      const updateData: { fullName?: string; email?: string } = {};
      if (fullName !== originalData.fullName) updateData.fullName = fullName;
      if (email !== originalData.email) updateData.email = email;

      if (Object.keys(updateData).length === 0) {
        showToast('No changes to save', 'info');
        setProfileLoading(false);
        return;
      }

      const response = await userAPI.updateProfile(updateData);
      const updatedUser = response.data.data.user;
      updateUser({ ...user!, ...updatedUser });
      setOriginalData({ fullName: updatedUser.fullName, email: updatedUser.email });
      showToast('Profile updated successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelProfile = () => {
    setFullName(originalData.fullName);
    setEmail(originalData.email);
    setProfileErrors({});
  };

  const validatePassword = () => {
    const errors: Record<string, string> = {};

    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(newPassword)) {
      errors.newPassword = 'Password must contain a lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(newPassword)) {
      errors.newPassword = 'Password must contain an uppercase letter';
    } else if (!/(?=.*\d)/.test(newPassword)) {
      errors.newPassword = 'Password must contain a number';
    }

    if (!confirmNewPassword) {
      errors.confirmNewPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) return;

    setPasswordLoading(true);
    try {
      await userAPI.changePassword({ currentPassword, newPassword });
      showToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p className="profile-subtitle">Manage your account settings</p>
      </div>

      <div className="profile-sections">
        <section className="profile-section">
          <h2>Profile Information</h2>
          <form onSubmit={handleProfileSubmit}>
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={profileErrors.fullName}
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={profileErrors.email}
            />
            <div className="profile-actions">
              <Button type="button" variant="secondary" onClick={handleCancelProfile}>
                Cancel
              </Button>
              <Button type="submit" loading={profileLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </section>

        <section className="profile-section">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={passwordErrors.currentPassword}
              autoComplete="current-password"
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={passwordErrors.newPassword}
              autoComplete="new-password"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              error={passwordErrors.confirmNewPassword}
              autoComplete="new-password"
            />
            <div className="profile-actions">
              <Button type="submit" loading={passwordLoading}>
                Change Password
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Profile;

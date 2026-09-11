import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiSave,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

const AdminSettings = () => {
  const { login } = useAuth();

  // Profile Form State
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [originalEmail, setOriginalEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Loaders
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      setProfile({
        name: res.data.name || 'Admin',
        email: res.data.email || '',
      });
      setOriginalEmail(res.data.email || '');
    } catch (err) {
      console.error('Failed to load profile:', err);
      showStatus('error', 'Failed to load admin profile details.');
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => {
      setStatus({ type: '', message: '' });
    }, 4500);
  };

  const isEmailChanged = profile.email.toLowerCase() !== originalEmail.toLowerCase();

  // 1. Update Profile (Name & Email)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      showStatus('error', 'Name cannot be empty.');
      return;
    }
    if (!profile.email.trim()) {
      showStatus('error', 'Email cannot be empty.');
      return;
    }

    if (isEmailChanged && !currentPasswordForEmail) {
      showStatus('error', 'Please enter your current password to change your email address.');
      return;
    }

    try {
      setSavingProfile(true);
      const payload = {
        name: profile.name.trim(),
        email: profile.email.trim().toLowerCase(),
      };

      if (isEmailChanged) {
        payload.current_password = currentPasswordForEmail;
      }

      const res = await api.put('/auth/profile', payload);

      if (res.data.access_token) {
        login(res.data.access_token);
      }

      setOriginalEmail(profile.email.trim().toLowerCase());
      setCurrentPasswordForEmail('');
      showStatus('success', 'Admin profile updated successfully!');
    } catch (err) {
      console.error('Profile update failed:', err);
      showStatus(
        'error',
        err.response?.data?.detail || 'Failed to update profile. Please check your inputs.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Change Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      showStatus('error', 'Please enter your current password.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showStatus('error', 'New password must be at least 6 characters long.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showStatus('error', 'New passwords do not match. Please verify.');
      return;
    }

    try {
      setSavingPassword(true);
      const payload = {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      };

      const res = await api.put('/auth/profile', payload);

      if (res.data.access_token) {
        login(res.data.access_token);
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      showStatus('success', 'Password updated successfully!');
    } catch (err) {
      console.error('Password change failed:', err);
      showStatus(
        'error',
        err.response?.data?.detail || 'Failed to change password. Make sure current password is correct.'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account profile, email address, and security credentials
        </p>
      </div>

      {/* Global Status Banner */}
      {status.message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ${
            status.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
              : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
          }`}
        >
          {status.type === 'error' ? (
            <FiAlertCircle className="text-xl shrink-0" />
          ) : (
            <FiCheckCircle className="text-xl shrink-0" />
          )}
          <span className="font-medium text-sm">{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Profile Information */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                <FiUser size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Profile Details</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Update your admin display name and email address
                </p>
              </div>
            </div>

            <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Admin Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiUser />
                  </div>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                    placeholder="Admin Name"
                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiMail />
                  </div>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    required
                    placeholder="admin@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Password confirmation if email is modified */}
              {isEmailChanged && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                    <FiShield /> Current Password Required to Change Email
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <FiLock />
                    </div>
                    <input
                      type={showEmailPassword ? 'text' : 'password'}
                      value={currentPasswordForEmail}
                      onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full pl-10 pr-10 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showEmailPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              form="profile-form"
              disabled={savingProfile}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition disabled:opacity-50"
            >
              <FiSave />
              <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Change Password */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                <FiShield size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Security & Password</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Update your admin account password
                </p>
              </div>
            </div>

            <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Current Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiLock />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    required
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-10 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiLock />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiLock />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    required
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-10 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              form="password-form"
              disabled={savingPassword}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition disabled:opacity-50"
            >
              <FiShield />
              <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

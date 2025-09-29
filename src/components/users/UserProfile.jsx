import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Globe, Bell, Palette, Camera, Save, X } from 'lucide-react';

const API_BASE_URL = 'https://backend-xc4z.vercel.app';

const UserProfile = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    bio: '',
    phone: '',
    timezone: 'UTC',
    notification_settings: { email: true, push: true, reminders: true },
    theme_settings: { theme: 'light', color: 'green' }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/profile`, { withCredentials: true });
      const userData = res.data;
      setProfile({
        ...userData,
        notification_settings: typeof userData.notification_settings === 'string' 
          ? JSON.parse(userData.notification_settings) 
          : userData.notification_settings || { email: true, push: true, reminders: true },
        theme_settings: typeof userData.theme_settings === 'string'
          ? JSON.parse(userData.theme_settings)
          : userData.theme_settings || { theme: 'light', color: 'green' }
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('Delete your avatar?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/users/avatar`, { withCredentials: true });
      setProfile({ ...profile, avatar_url: null });
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (err) {
      console.error('Failed to delete avatar:', err);
      setError('Failed to delete avatar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const avatarRes = await axios.post(`${API_BASE_URL}/users/avatar`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        profile.avatar_url = avatarRes.data.avatar_url;
      }

      // Update profile - only send updatable fields (include avatar_url if it was just uploaded)
      const { ...profileData } = profile;
      await axios.put(`${API_BASE_URL}/users/profile`, profileData, { withCredentials: true });

      // Refresh profile data to get updated avatar_url from database
      await fetchProfile();

      // Clear avatar upload state
      setAvatarFile(null);
      setAvatarPreview(null);

      // Close modal after everything is done
      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Show validation errors
        setError(errorData.errors.map(e => e.msg).join(', '));
      } else {
        setError(errorData?.error || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <User className="w-5 h-5 mr-2" />
            User Profile
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="text-center">
            <div className="relative inline-block">
              {avatarPreview || profile.avatar_url ? (
                <img
                  src={
                    avatarPreview ||
                    (profile.avatar_url?.startsWith('http')
                      ? profile.avatar_url
                      : `${API_BASE_URL}${profile.avatar_url}`)
                  }
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl font-bold border-4 border-gray-200">
                  {profile.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            {(profile.avatar_url || avatarPreview) && (
              <button
                type="button"
                onClick={handleDeleteAvatar}
                className="mt-2 text-red-600 hover:text-red-800 text-sm"
              >
                Remove Avatar
              </button>
            )}
          </div>

          {/* Basic Info - Username and Email are read-only */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Username
              </label>
              <input
                type="text"
                value={profile.username}
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              maxLength="500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone
              </label>
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Globe className="w-4 h-4 inline mr-1" />
                Timezone
              </label>
              <select
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Asia/Karachi">Karachi</option>
                <option value="Asia/Kolkata">Mumbai</option>
              </select>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Bell className="w-4 h-4 inline mr-1" />
              Notification Settings
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.notification_settings.email}
                  onChange={(e) => setProfile({
                    ...profile,
                    notification_settings: { ...profile.notification_settings, email: e.target.checked }
                  })}
                  className="mr-2"
                />
                Email notifications
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.notification_settings.push}
                  onChange={(e) => setProfile({
                    ...profile,
                    notification_settings: { ...profile.notification_settings, push: e.target.checked }
                  })}
                  className="mr-2"
                />
                Push notifications
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.notification_settings.reminders}
                  onChange={(e) => setProfile({
                    ...profile,
                    notification_settings: { ...profile.notification_settings, reminders: e.target.checked }
                  })}
                  className="mr-2"
                />
                Task reminders
              </label>
            </div>
          </div>

          {/* Theme Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Palette className="w-4 h-4 inline mr-1" />
              Theme Settings
            </label>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Theme</label>
                <select
                  value={profile.theme_settings.theme}
                  onChange={(e) => setProfile({
                    ...profile,
                    theme_settings: { ...profile.theme_settings, theme: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Color Scheme</label>
                <select
                  value={profile.theme_settings.color}
                  onChange={(e) => setProfile({
                    ...profile,
                    theme_settings: { ...profile.theme_settings, color: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="green">Green</option>
                  <option value="blue">Blue</option>
                  <option value="purple">Purple</option>
                  <option value="red">Red</option>
                  <option value="orange">Orange</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Save className="w-4 h-4 mr-1" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
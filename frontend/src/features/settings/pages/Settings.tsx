/**
 * Settings Page
 * User settings and preferences with reusable form components
 * 
 * @module features/settings/pages/Settings
 */

import { useState, type JSX, type FormEvent } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Save } from 'lucide-react';
import { PageHeader, LoadingSpinner } from '@/components/common';
import { 
  FormInput, 
  FormSelect, 
  FormSwitch, 
  FormTextarea 
} from '@/components/forms';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

// ============================================
// Types
// ============================================

interface ProfileFormData {
  full_name: string;
  email: string;
  bio: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  browser_notifications: boolean;
  daily_digest: boolean;
  task_reminders: boolean;
  weekly_summary: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es' | 'fr' | 'de';
  compact_mode: boolean;
}

// ============================================
// Component
// ============================================

export default function Settings(): JSX.Element {
  const user = useAuthStore((state) => state.user);
  
  // Profile State
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    full_name: user?.full_name ?? '',
    email: user?.email ?? '',
    bio: '',
  });

  // Notification State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    browser_notifications: true,
    daily_digest: false,
    task_reminders: true,
    weekly_summary: false,
  });

  // Appearance State
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'light',
    language: 'en',
    compact_mode: false,
  });

  // ============================================
  // Handlers
  // ============================================

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings): void => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('Notification preference updated');
  };

  const handleAppearanceChange = (
    key: keyof AppearanceSettings,
    value: string | boolean
  ): void => {
    setAppearanceSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    toast.success('Appearance setting updated');
  };

  // ============================================
  // Render
  // ============================================

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<SettingsIcon className="w-8 h-8" />}
        title="Settings"
        description="Manage your account and preferences"
      />

      {/* Profile Settings */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
              <p className="text-sm text-gray-600">Update your personal information</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormInput
              label="Full Name"
              type="text"
              value={profileData.full_name}
              onChange={(e) => setProfileData((prev) => ({ ...prev, full_name: e.target.value }))}
              placeholder="John Doe"
              leftIcon={<User className="w-5 h-5" />}
              required
            />

            <FormInput
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="john@example.com"
              required
              disabled
              hint="Email cannot be changed"
            />
          </div>

          <FormTextarea
            label="Bio"
            value={profileData.bio}
            onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us a bit about yourself..."
            rows={3}
            maxLength={200}
            showCharCount
          />

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={profileLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
            >
              {profileLoading ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Notification Settings */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">Configure how you receive notifications</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <FormSwitch
            label="Email Notifications"
            description="Receive email updates about your tasks"
            checked={notificationSettings.email_notifications}
            onChange={() => handleNotificationChange('email_notifications')}
          />

          <FormSwitch
            label="Browser Notifications"
            description="Get push notifications in your browser"
            checked={notificationSettings.browser_notifications}
            onChange={() => handleNotificationChange('browser_notifications')}
          />

          <FormSwitch
            label="Task Reminders"
            description="Receive reminders for upcoming due dates"
            checked={notificationSettings.task_reminders}
            onChange={() => handleNotificationChange('task_reminders')}
          />

          <FormSwitch
            label="Daily Digest"
            description="Receive a daily summary of your tasks"
            checked={notificationSettings.daily_digest}
            onChange={() => handleNotificationChange('daily_digest')}
          />

          <FormSwitch
            label="Weekly Summary"
            description="Get a weekly productivity report"
            checked={notificationSettings.weekly_summary}
            onChange={() => handleNotificationChange('weekly_summary')}
          />
        </div>
      </section>

      {/* Appearance Settings */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
              <p className="text-sm text-gray-600">Customize how the app looks</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormSelect
              label="Theme"
              value={appearanceSettings.theme}
              onChange={(e) => handleAppearanceChange('theme', e.target.value)}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ]}
              leftIcon={<Palette className="w-5 h-5" />}
            />

            <FormSelect
              label="Language"
              value={appearanceSettings.language}
              onChange={(e) => handleAppearanceChange('language', e.target.value)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' },
              ]}
            />
          </div>

          <FormSwitch
            label="Compact Mode"
            description="Use smaller spacing and elements"
            checked={appearanceSettings.compact_mode}
            onChange={() => handleAppearanceChange('compact_mode', !appearanceSettings.compact_mode)}
          />
        </div>
      </section>

      {/* Security Settings */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <p className="text-sm text-gray-600">Manage your account security</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-medium text-gray-900">Password</h3>
              <p className="text-sm text-gray-600">Last changed 30 days ago</p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Change Password
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-medium text-white transition-colors"
            >
              Enable 2FA
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <div>
              <h3 className="font-medium text-red-900">Delete Account</h3>
              <p className="text-sm text-red-600">Permanently delete your account and data</p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium text-white transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
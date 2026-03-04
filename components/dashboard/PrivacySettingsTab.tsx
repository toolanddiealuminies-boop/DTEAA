import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Save, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { UserData, PrivacySettings } from '../../types';

interface PrivacySettingsTabProps {
  userData: UserData;
  onUpdate: (privacy: PrivacySettings) => void;
}

const PrivacySettingsTab: React.FC<PrivacySettingsTabProps> = ({ userData, onUpdate }) => {
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    showEmail: userData.privacy?.showEmail ?? true,
    showPhone: userData.privacy?.showPhone ?? false,
    showCompany: userData.privacy?.showCompany ?? false,
    showLocation: userData.privacy?.showLocation ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof PrivacySettings) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('privacy_settings')
        .update({
          show_email: privacy.showEmail,
          show_phone: privacy.showPhone,
          show_company: privacy.showCompany,
          show_location: privacy.showLocation,
        })
        .eq('user_id', userData.id);

      if (error) throw error;

      onUpdate(privacy);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving privacy settings:', err);
      alert('Failed to save privacy settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleItems = [
    {
      key: 'showEmail' as keyof PrivacySettings,
      label: 'Email Address',
      description: 'Allow other alumni to see your email address in the directory',
    },
    {
      key: 'showPhone' as keyof PrivacySettings,
      label: 'Phone Number',
      description: 'Allow other alumni to see your phone number in the directory',
    },
    {
      key: 'showCompany' as keyof PrivacySettings,
      label: 'Company & Designation',
      description: 'Allow other alumni to see your current company and role',
    },
    {
      key: 'showLocation' as keyof PrivacySettings,
      label: 'Location',
      description: 'Allow other alumni to see your city and country',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-light-text-primary">Privacy Settings</h1>
          <p className="text-sm text-light-text-secondary">
            Control what information is visible to other alumni in the directory
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-light-border overflow-hidden">
        <div className="p-6 border-b border-light-border bg-gray-50">
          <h3 className="font-semibold text-light-text-primary">Directory Visibility</h3>
          <p className="text-sm text-light-text-secondary mt-1">
            Your name, batch year, and profile photo are always visible in the directory.
          </p>
        </div>

        <div className="divide-y divide-light-border">
          {toggleItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2">
                  {privacy[item.key] ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="font-medium text-light-text-primary">{item.label}</span>
                </div>
                <p className="text-sm text-light-text-secondary mt-1 ml-6">{item.description}</p>
              </div>
              <button
                onClick={() => handleToggle(item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacy[item.key] ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacy[item.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-light-text-secondary">
          Changes will be reflected immediately in the alumni directory after saving.
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-primary text-white hover:bg-primary-hover'
          } disabled:opacity-50`}
        >
          {saving ? (
            'Saving...'
          ) : saved ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default PrivacySettingsTab;

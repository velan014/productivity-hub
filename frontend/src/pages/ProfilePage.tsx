import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userApi } from '../services/userApi';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { formatDate } from '../utils/date';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Avatar presets for quick customization
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || 'productivity')}`,
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(user?.name || 'velan')}`,
  ];

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      error('Name cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      const res = await userApi.updateProfile({
        name: name.trim(),
        avatar: avatar.trim() || null,
      });

      updateUser(res.data.user);
      success('Profile updated');
    } catch (err: any) {
      error(err.message || 'Unable to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
  };

  return (
    <div className="max-w-3xl space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          User Profile
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal account information and avatar.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="relative group">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-500/20 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-3xl font-bold ring-4 ring-emerald-500/20">
                {name ? name[0].toUpperCase() : 'U'}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Profile Avatar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pick a preset avatar, generate an illustrated avatar, or enter an image URL.
              </p>
            </div>

            {/* Avatar Preset Options */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {avatarPresets.map((presetUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(presetUrl)}
                  className={`relative w-10 h-10 rounded-xl overflow-hidden ring-2 transition-all min-h-[40px] min-w-[40px] ${
                    avatar === presetUrl
                      ? 'ring-emerald-500 scale-105 shadow-sm'
                      : 'ring-transparent hover:ring-slate-300 dark:hover:ring-slate-700 opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Select avatar option ${idx + 1}`}
                >
                  <img src={presetUrl} alt="Avatar option" className="w-full h-full object-cover" />
                  {avatar === presetUrl && (
                    <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRandomizeAvatar}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="text-xs h-10"
              >
                Randomize
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address (Read-only)"
              type="email"
              value={user?.email || ''}
              disabled
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Email address cannot be changed in Phase 1."
            />
          </div>

          <Input
            label="Avatar Image URL (Optional)"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            helperText="You can also paste a direct HTTPS image URL."
          />

          {/* Account Metadata */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Member since
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.created_at ? formatDate(user.created_at) : 'Active User'}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full sm:w-auto"
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

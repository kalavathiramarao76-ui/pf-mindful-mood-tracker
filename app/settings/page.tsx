use client;

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { saveSettings, getSettings } from '../../lib/storage';
import { Settings } from '../../types/settings';

const settingsSchema = z.object({
  theme: z.string().optional(),
  notifications: z.boolean().optional(),
  reminders: z.boolean().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

const SettingsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: getSettings(),
  });

  const onSubmit = async (data: SettingsForm) => {
    setLoading(true);
    try {
      await saveSettings(data);
      toast.success('Settings saved successfully');
      router.push('/');
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 md:p-6 lg:p-8 mt-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-2" htmlFor="theme">
            Theme
          </label>
          <select
            id="theme"
            className="block w-full p-2 pl-10 text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            {...register('theme')}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          {errors.theme && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.theme.message}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-2" htmlFor="notifications">
            Notifications
          </label>
          <input
            id="notifications"
            type="checkbox"
            className="w-4 h-4 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-gray-500"
            {...register('notifications')}
          />
          {errors.notifications && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.notifications.message}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-2" htmlFor="reminders">
            Reminders
          </label>
          <input
            id="reminders"
            type="checkbox"
            className="w-4 h-4 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-gray-500"
            {...register('reminders')}
          />
          {errors.reminders && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.reminders.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full p-2 pl-5 pr-5 bg-gray-500 text-gray-100 text-lg rounded-lg focus:border-4 border-gray-300"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
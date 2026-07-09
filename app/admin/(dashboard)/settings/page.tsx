"use client";

import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { getSettings, updateSettings } from "@/actions/settings";
import { Save, Loader2, Check } from "lucide-react";

interface SettingsState {
  site_name: string;
  site_description: string;
  site_logo: string;
  site_favicon: string;
  seo_title: string;
  seo_description: string;
  social_twitter: string;
  social_facebook: string;
  social_instagram: string;
  social_linkedin: string;
  footer_text: string;
  posts_per_page: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const data = await getSettings();
    setSettings(data as any);
  }

  function handleChange(key: keyof SettingsState, val: string | number) {
    if (!settings) return;
    setSettings({
      ...settings,
      [key]: val,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setError("");
    setSuccess(false);

    const formData = new FormData();
    Object.entries(settings).forEach(([k, v]) => {
      formData.set(k, String(v));
    });

    startTransition(async () => {
      const res = await updateSettings(formData);
      if (!res.success) {
        setError(res.error || "Failed to update settings");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title="Settings" description="Configure your CMS instance settings." />

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-250 dark:border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Site Name</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => handleChange("site_name", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Posts Per Page</label>
              <input
                type="number"
                value={settings.posts_per_page}
                onChange={(e) => handleChange("posts_per_page", Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                min={1}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Site Description</label>
            <textarea
              value={settings.site_description}
              onChange={(e) => handleChange("site_description", e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logo URL</label>
              <input
                type="text"
                value={settings.site_logo}
                onChange={(e) => handleChange("site_logo", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Favicon URL</label>
              <input
                type="text"
                value={settings.site_favicon}
                onChange={(e) => handleChange("site_favicon", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Global SEO Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">Global SEO Defaults</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SEO Title Override</label>
            <input
              type="text"
              value={settings.seo_title}
              onChange={(e) => handleChange("seo_title", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              maxLength={70}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SEO Meta Description</label>
            <textarea
              value={settings.seo_description}
              onChange={(e) => handleChange("seo_description", e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              maxLength={160}
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Twitter URL</label>
              <input
                type="text"
                value={settings.social_twitter}
                onChange={(e) => handleChange("social_twitter", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="https://twitter.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Facebook URL</label>
              <input
                type="text"
                value={settings.social_facebook}
                onChange={(e) => handleChange("social_facebook", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="https://facebook.com/page"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instagram URL</label>
              <input
                type="text"
                value={settings.social_instagram}
                onChange={(e) => handleChange("social_instagram", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="https://instagram.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">LinkedIn URL</label>
              <input
                type="text"
                value={settings.social_linkedin}
                onChange={(e) => handleChange("social_linkedin", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">Footer</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Footer Copyright Text</label>
            <input
              type="text"
              value={settings.footer_text}
              onChange={(e) => handleChange("footer_text", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Settings
        </button>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const Settings = () => {
  const { user, updateSettings, loading } = useAuth();
  const [form, setForm] = useState({
    theme: "light",
    notifications: { email: true, sms: true, push: true },
    preferences: { language: "en", currency: "USD", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    privacy: { profileVisibility: "public", showEmail: false, showPhone: false },
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.settings) {
      setForm({
        theme: user.settings.theme ?? "light",
        notifications: {
          email: user.settings.notifications?.email ?? true,
          sms: user.settings.notifications?.sms ?? true,
          push: user.settings.notifications?.push ?? true,
        },
        preferences: {
          language: user.settings.preferences?.language ?? "en",
          currency: user.settings.preferences?.currency ?? "USD",
          timezone: user.settings.preferences?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        privacy: {
          profileVisibility: user.settings.privacy?.profileVisibility ?? "public",
          showEmail: user.settings.privacy?.showEmail ?? false,
          showPhone: user.settings.privacy?.showPhone ?? false,
        },
      });
    }
  }, [user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await updateSettings({ settings: form });
      setMessage("Settings saved");
    } catch (err) {
      setError(err.message || "Failed to save settings");
    }
  };

  const setNested = (path, value) => {
    setForm((prev) => {
      const clone = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let obj = clone;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return clone;
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      {message && <div className="mb-3 text-green-700">{message}</div>}
      {error && <div className="mb-3 text-red-700">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-6 bg-white p-4 sm:p-6 rounded-lg shadow">
        <section>
          <h2 className="font-semibold mb-2">Appearance</h2>
          <select
            value={form.theme}
            onChange={(e) => setNested("theme", e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Notifications</h2>
          <label className="block mb-1">
            <input
              type="checkbox"
              checked={form.notifications.email}
              onChange={(e) => setNested("notifications.email", e.target.checked)}
              className="mr-2"
            />
            Email
          </label>
          <label className="block mb-1">
            <input
              type="checkbox"
              checked={form.notifications.sms}
              onChange={(e) => setNested("notifications.sms", e.target.checked)}
              className="mr-2"
            />
            SMS
          </label>
          <label className="block">
            <input
              type="checkbox"
              checked={form.notifications.push}
              onChange={(e) => setNested("notifications.push", e.target.checked)}
              className="mr-2"
            />
            Push
          </label>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Privacy</h2>
          <div className="mb-2">
            <label className="mr-2">Profile visibility</label>
            <select
              value={form.privacy.profileVisibility}
              onChange={(e) => setNested("privacy.profileVisibility", e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="public">Public</option>
              <option value="friends">Friends</option>
              <option value="private">Private</option>
            </select>
          </div>
          <label className="block mb-1">
            <input
              type="checkbox"
              checked={form.privacy.showEmail}
              onChange={(e) => setNested("privacy.showEmail", e.target.checked)}
              className="mr-2"
            />
            Show email
          </label>
          <label className="block">
            <input
              type="checkbox"
              checked={form.privacy.showPhone}
              onChange={(e) => setNested("privacy.showPhone", e.target.checked)}
              className="mr-2"
            />
            Show phone
          </label>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
};

export default Settings;

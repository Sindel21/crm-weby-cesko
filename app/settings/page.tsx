'use client';

import { useState, useEffect } from 'react';
import { Save, Key, ShieldCheck, Cpu, Globe, RefreshCcw } from 'lucide-react';

const SettingsPage = () => {
    const [settings, setSettings] = useState<any>({
        apify_token: '',
        gemini_api_key: '',
        pagespeed_api_key: '',
        upstash_redis_url: '',
        upstash_redis_token: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/settings')
            .then((res) => res.json())
            .then((data) => {
                setSettings(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                setMessage('Settings saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Error saving settings.');
            }
        } catch (err) {
            setMessage('Network error.');
        }
        setSaving(false);
    };

    if (loading) return <div className="p-8 text-center text-zinc-500">Loading settings...</div>;

    return (
        <div className="space-y-8 p-8 max-w-4xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-zinc-500 mt-2">Manage your API keys and external service configurations.</p>
            </header>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-8 space-y-8">
                    {/* Apify */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
                            <RefreshCcw className="text-orange-500" size={20} />
                            <h3 className="font-semibold text-lg">Apify Scraper</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-sm font-medium text-zinc-500 mb-1 block">API Token</label>
                                <input
                                    type="password"
                                    value={settings.apify_token || ''}
                                    onChange={(e) => setSettings({ ...settings, apify_token: e.target.value })}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="apify_api_..."
                                />
                            </div>
                        </div>
                    </section>

                    <hr className="border-zinc-100 dark:border-zinc-800" />

                    {/* Gemini */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
                            <Cpu className="text-blue-500" size={20} />
                            <h3 className="font-semibold text-lg">Google Gemini AI</h3>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-zinc-500 mb-1 block">API Key</label>
                            <input
                                type="password"
                                value={settings.gemini_api_key || ''}
                                onChange={(e) => setSettings({ ...settings, gemini_api_key: e.target.value })}
                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="AIza..."
                            />
                        </div>
                    </section>

                    <hr className="border-zinc-100 dark:border-zinc-800" />

                    {/* PageSpeed */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
                            <Globe className="text-green-500" size={20} />
                            <h3 className="font-semibold text-lg">PageSpeed Insights</h3>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-zinc-500 mb-1 block">API Key</label>
                            <input
                                type="password"
                                value={settings.pagespeed_api_key || ''}
                                onChange={(e) => setSettings({ ...settings, pagespeed_api_key: e.target.value })}
                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Google Cloud API Key"
                            />
                        </div>
                    </section>

                    <hr className="border-zinc-100 dark:border-zinc-800" />

                    {/* Redis */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
                            <ShieldCheck className="text-purple-500" size={20} />
                            <h3 className="font-semibold text-lg">Upstash Redis (Queue)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-zinc-500 mb-1 block">REST URL</label>
                                <input
                                    type="text"
                                    value={settings.upstash_redis_url || ''}
                                    onChange={(e) => setSettings({ ...settings, upstash_redis_url: e.target.value })}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-zinc-500 mb-1 block">REST Token</label>
                                <input
                                    type="password"
                                    value={settings.upstash_redis_token || ''}
                                    onChange={(e) => setSettings({ ...settings, upstash_redis_token: e.target.value })}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="token"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <p className={`text-sm font-medium ${message.includes('success') ? 'text-green-600' : 'text-zinc-500'}`}>
                        {message}
                    </p>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

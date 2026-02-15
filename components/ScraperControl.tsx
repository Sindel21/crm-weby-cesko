'use client';

import { useState } from 'react';
import { Search, Zap, Loader2, MapPin, CheckCircle2 } from 'lucide-react';

export const ScraperControl = () => {
    const [category, setCategory] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const handleStartScan = async () => {
        if (!category) return;

        setIsScanning(true);
        setStatus('Initializing national scan...');

        try {
            const res = await fetch('/api/scrape/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category }),
            });

            if (res.ok) {
                setStatus('Scan started! Results will appear in your leads list shortly.');
            } else {
                setStatus('Error starting scan.');
            }
        } catch (err) {
            setStatus('Network error.');
        }

        setIsScanning(false);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Zap className="text-blue-600" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Lead Harvester</h2>
                    <p className="text-sm text-zinc-500">Scan the entire Czech Republic for new opportunities.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Restaurace, Autoservis, Instalatér..."
                        className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <button
                    onClick={handleStartScan}
                    disabled={isScanning || !category}
                    className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
                >
                    {isScanning ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Scanning...
                        </>
                    ) : (
                        <>
                            <MapPin size={18} />
                            Scan Czech Republic
                        </>
                    )}
                </button>
            </div>

            {status && (
                <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${status.includes('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                    {status.includes('started') ? <CheckCircle2 size={18} /> : null}
                    <span className="text-sm font-medium">{status}</span>
                </div>
            )}
        </div>
    );
};

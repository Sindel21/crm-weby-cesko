'use client';

import { useState, useEffect } from 'react';
import { Loader2, Zap, CheckCircle2 } from 'lucide-react';

export const GlobalScanStatus = () => {
    const [status, setStatus] = useState<any>(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/scrape/status');
                const data = await res.json();
                if (data && !data.error) {
                    setStatus(data);
                }
            } catch (err) {
                console.error('Failed to fetch scan status');
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const togglePause = async () => {
        try {
            const res = await fetch('/api/scrape/pause', { method: 'POST' });
            const data = await res.json();
            if (data && !data.error) {
                setStatus({ ...status, is_paused: data.is_paused });
            }
        } catch (err) {
            console.error('Failed to toggle pause');
        }
    };

    const stopScan = async () => {
        if (!confirm('Opravdu chcete skenování zastavit?')) return;
        try {
            const res = await fetch('/api/scrape/stop', { method: 'POST' });
            if (res.ok) {
                setStatus({ ...status, is_active: false, is_paused: false });
            }
        } catch (err) {
            console.error('Failed to stop scan');
        }
    };

    if (!status || (!status.is_active && !status.completed_towns)) return null;

    const percentage = Math.round((status.completed_towns / status.total_towns) * 100);

    return (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 mb-4 mx-2">
            <div className="flex items-center gap-3 mb-2">
                {status.is_active ? (
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-lg">
                        <Loader2 className={`text-blue-600 dark:text-blue-400 ${status.is_paused ? '' : 'animate-spin'}`} size={14} />
                    </div>
                ) : (
                    <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-lg">
                        <CheckCircle2 className="text-green-600 dark:text-green-400" size={14} />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-100 truncate">
                        {status.is_active ? `${status.is_paused ? 'Paused' : 'Scanning'}: ${status.category}` : 'Scan Completed'}
                    </p>
                    {status.is_active && (
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 truncate font-medium">
                            Current: {status.current_city} ({status.completed_towns}/{status.total_towns})
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    <span>{percentage}% Complete</span>
                    <span>{status.leads_found} Leady</span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800/50 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-blue-600 dark:bg-blue-400 h-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {status.is_active && (
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={togglePause}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-800/50 rounded-lg text-[10px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50 transition-colors"
                    >
                        {status.is_paused ? <Zap size={12} /> : <Loader2 size={12} />}
                        {status.is_paused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                        onClick={stopScan}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/30 rounded-lg text-[10px] font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                        Stop
                    </button>
                </div>
            )}
        </div>
    );
};

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

    if (!status || (!status.is_active && !status.completed_towns)) return null;

    const percentage = Math.round((status.completed_towns / status.total_towns) * 100);

    return (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 mb-4 mx-2">
            <div className="flex items-center gap-3 mb-2">
                {status.is_active ? (
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-lg">
                        <Loader2 className="text-blue-600 dark:text-blue-400 animate-spin" size={14} />
                    </div>
                ) : (
                    <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-lg">
                        <CheckCircle2 className="text-green-600 dark:text-green-400" size={14} />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-100 truncate">
                        {status.is_active ? `Scanning: ${status.category}` : 'Scan Completed'}
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
        </div>
    );
};

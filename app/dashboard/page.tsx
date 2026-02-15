'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Target, CheckCircle } from 'lucide-react';
import { ScraperControl } from '@/components/ScraperControl';

const Dashboard = () => {
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/stats')
            .then(res => res.json())
            .then(data => {
                setStatsData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const stats = [
        { label: 'Total Leads', value: statsData?.totalLeads || '0', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'New Leads', value: statsData?.newLeads || '0', icon: Target, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { label: 'Calls Today', value: statsData?.callsToday || '0', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        { label: 'Converted', value: statsData?.successRate || '0%', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    ];

    if (loading) return <div className="p-8 text-center text-zinc-500">Loading dashboard...</div>;

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
                <p className="text-zinc-500 mt-2">Welcome back! Here's what's happening today.</p>
            </header>

            <ScraperControl />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-transform hover:scale-[1.02]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
                            <TrendingUp size={12} className="mr-1" />
                            <span>+12.5% from last week</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4">Pipeline Overview</h3>
                    <div className="h-64 flex items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
                        [Chart Placeholder]
                    </div>
                </div>
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4">Upcoming Calls</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center font-bold">C</div>
                                    <div>
                                        <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Café Merkur</p>
                                        <p className="text-xs text-zinc-500">Prague • Today at 2:00 PM</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">New Lead</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

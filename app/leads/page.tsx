'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Phone, MoreHorizontal, ExternalLink } from 'lucide-react';

const LeadsPage = () => {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/leads')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setLeads(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8 text-center text-zinc-500">Loading leads...</div>;

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Leads Management</h1>
                    <p className="text-zinc-500 mt-2">Manage and track your highest potential leads.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
                        />
                    </div>
                    <button className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm text-zinc-600 dark:text-zinc-400">
                        <Filter size={20} />
                    </button>
                </div>
            </header>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Metriky</th>
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Kontakt</th>
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        {lead.website ? (
                                            <a
                                                href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 transition-colors flex items-center gap-1"
                                            >
                                                {lead.company}
                                                <ExternalLink size={12} className="opacity-50" />
                                            </a>
                                        ) : (
                                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{lead.company}</p>
                                        )}
                                        <p className="text-sm text-zinc-500">{lead.city}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full w-fit font-medium ${lead.mobileSpeed < 50 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : lead.mobileSpeed < 90 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-green-100 text-green-700'}`}>
                                            Speed: {lead.mobileSpeed}
                                        </span>
                                        {lead.loadTime && (
                                            <span className="text-[10px] text-zinc-500 font-medium px-2">
                                                Load: {lead.loadTime.toFixed(1)}s
                                            </span>
                                        )}
                                        {lead.ads && (
                                            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full w-fit font-medium">
                                                Google Ads
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-10 h-10 border-2 rounded-full flex items-center justify-center text-sm font-bold ${lead.score < 50 ? 'border-red-500 text-red-500' : lead.score < 90 ? 'border-orange-500 text-orange-500' : 'border-green-500 text-green-500'}`}>
                                            {lead.score}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-full font-medium capitalize">
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-sm font-medium">{lead.owner}</p>
                                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                            <Phone size={12} /> {lead.phone}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-blue-500">
                                            <ExternalLink size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeadsPage;

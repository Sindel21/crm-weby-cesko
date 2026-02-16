'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Phone, MoreHorizontal, ExternalLink, Wand2, Loader2, RefreshCw } from 'lucide-react';

const LeadsPage = () => {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({});

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads');
            const data = await res.json();
            if (Array.isArray(data)) setLeads(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleAnalyze = async (leadId: string) => {
        setAnalyzingIds(prev => ({ ...prev, [leadId]: true }));
        try {
            const res = await fetch('/api/leads/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId })
            });
            const result = await res.json();
            if (result.success) {
                // Refresh leads to show updated data
                await fetchLeads();
            } else {
                alert('Analysis failed: ' + result.error);
            }
        } catch (err) {
            console.error('Analysis error:', err);
            alert('Analysis failed due to a network error.');
        } finally {
            setAnalyzingIds(prev => ({ ...prev, [leadId]: false }));
        }
    };

    const handleAnalyzeAll = async () => {
        const unanalyzedLeads = leads.filter(l => !l.score || l.score === 0);
        if (unanalyzedLeads.length === 0) {
            alert('Žádné nové leady k analýze.');
            return;
        }

        if (!confirm(`Chcete analyzovat ${unanalyzedLeads.length} nových leadů? Může to chvíli trvat.`)) return;

        for (const lead of unanalyzedLeads) {
            await handleAnalyze(lead.id);
        }
    };

    if (loading) return <div className="p-8 text-center text-zinc-500">Loading leads...</div>;

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Leads Management</h1>
                    <p className="text-zinc-500 mt-2">Manage and track your highest potential leads.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAnalyzeAll}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm text-sm font-medium"
                    >
                        <Wand2 size={16} />
                        Analyzovat vše nové
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm text-sm"
                        />
                    </div>
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
                                    <div className="flex flex-col gap-1 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full w-fit font-medium text-xs ${lead.mobileSpeed < 50 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : lead.mobileSpeed < 90 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-green-100 text-green-700'}`}>
                                                Speed: {lead.mobileSpeed || 0}
                                            </span>
                                            {analyzingIds[lead.id] && <Loader2 size={14} className="animate-spin text-blue-500" />}
                                        </div>
                                        {lead.loadTime > 0 && (
                                            <span className="text-[10px] text-zinc-500 font-medium px-2">
                                                Load: {lead.loadTime.toFixed(1)}s
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-10 h-10 border-2 rounded-full flex items-center justify-center text-sm font-bold ${lead.score < 50 ? 'border-red-500 text-red-500' : lead.score < 90 ? 'border-orange-500 text-orange-500' : 'border-green-500 text-green-500'}`}>
                                            {lead.score || 0}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-full font-medium capitalize">
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm">
                                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{lead.owner || 'Neznámý majitel'}</p>
                                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                            <Phone size={12} /> {lead.phone || 'Bez telefonu'}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleAnalyze(lead.id)}
                                            disabled={analyzingIds[lead.id]}
                                            className={`p-2 rounded-lg transition-colors ${analyzingIds[lead.id] ? 'text-zinc-300' : 'text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                                            title="Re-analyze lead"
                                        >
                                            {analyzingIds[lead.id] ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                                        </button>
                                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-blue-500">
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

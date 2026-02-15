'use client';

import { useState } from 'react';
import { ChevronLeft, Globe, Zap, Shield, Megaphone, Phone, MessageSquare, Save } from 'lucide-react';
import Link from 'next/link';

const LeadDetail = ({ params }: { params: { id: string } }) => {
    const [status, setStatus] = useState('new');
    const [notes, setNotes] = useState('');

    // Mock data
    const lead = {
        name: 'Restaurace Pod Lipou',
        address: 'Vodičkova 12, Praha 1',
        website: 'https://restaurace-pod-lipou.cz',
        owner: 'Jan Novák',
        phone: '+420 777 123 456',
        score: 85,
        mobileSpeed: 24,
        desktopSpeed: 58,
        hasSsl: false,
        usesAds: true,
        aiPitch: "Dobrý den, pane Nováku. Všiml jsem si, že investujete do reklamy, ale váš mobilní web se načítá pomalu, což vám zbytečně utrácí budget. Rád bych vám ukázal, jak to během týdne opravit."
    };

    return (
        <div className="space-y-8 p-8 max-w-5xl mx-auto">
            <Link href="/leads" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors w-fit">
                <ChevronLeft size={20} />
                Back to Leads
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">{lead.name}</h1>
                    <p className="text-zinc-500 mt-2 flex items-center gap-2">
                        <Globe size={16} /> {lead.website}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="new">New</option>
                        <option value="called">Called</option>
                        <option value="interested">Interested</option>
                        <option value="not_interested">Not Interested</option>
                        <option value="closed">Closed</option>
                    </select>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/20">
                        <Phone size={18} />
                        Call Lead
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Web Analysis</h3>
                        <div className={`p-2 rounded-lg ${lead.score > 70 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            <Zap size={20} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-500">Mobile Speed</span>
                            <span className={`font-bold ${lead.mobileSpeed < 50 ? 'text-red-500' : 'text-green-500'}`}>{lead.mobileSpeed}/100</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-500">Desktop Speed</span>
                            <span className="font-bold">{lead.desktopSpeed}/100</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-500 flex items-center gap-1"><Shield size={14} /> SSL</span>
                            <span className={lead.hasSsl ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>{lead.hasSsl ? 'YES' : 'NO'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-500 flex items-center gap-1"><Megaphone size={14} /> Google Ads</span>
                            <span className={lead.usesAds ? 'text-blue-500 font-bold' : 'text-zinc-400 font-bold'}>{lead.usesAds ? 'ACTIVE' : 'NONE'}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">Owner / Decision Maker</p>
                            <p className="font-medium mt-1">{lead.owner}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">Phone</p>
                            <p className="font-medium mt-1">{lead.phone}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">Address</p>
                            <p className="font-medium mt-1 text-sm">{lead.address}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Lead Score</p>
                    <div className="w-24 h-24 border-4 border-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-3xl font-black text-blue-600">{lead.score}</span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-4">High Potential Opportunity</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Zap size={20} className="text-yellow-500" />
                        AI Recommended Pitch
                    </h3>
                    <div className="p-6 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-2xl relative">
                        <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
                            "{lead.aiPitch}"
                        </p>
                        <button className="mt-4 text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-widest hover:underline">
                            Regenerate Pitch
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <MessageSquare size={20} className="text-blue-500" />
                        Call Notes
                    </h3>
                    <textarea
                        className="w-full h-40 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        placeholder="Add notes from the call..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <button className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-xl font-semibold transition-colors w-fit shadow-lg">
                        <Save size={18} />
                        Save Notes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadDetail;

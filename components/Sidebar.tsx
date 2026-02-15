'use client';

import Link from 'next/link';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import { GlobalScanStatus } from './GlobalScanStatus';

const Sidebar = () => {
    return (
        <div className="flex flex-col h-screen w-64 bg-zinc-900 text-zinc-400 p-4 border-r border-zinc-800">
            <div className="flex items-center gap-3 px-2 py-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                <span className="text-white font-bold text-lg tracking-tight">Opportunity CRM</span>
            </div>

            <nav className="flex-1 mt-6 space-y-1">
                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors">
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link href="/leads" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors">
                    <Users size={20} />
                    <span>Leads</span>
                </Link>
            </nav>

            <GlobalScanStatus />

            <div className="mt-auto space-y-1">
                <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors">
                    <Settings size={20} />
                    <span>Settings</span>
                </Link>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-900/20 hover:text-red-400 transition-colors">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

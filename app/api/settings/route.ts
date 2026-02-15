import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        const { rows } = await sql`SELECT key, value FROM settings`;
        // Transform array to object for easier use
        const settings = rows.reduce((acc: any, row: any) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Ensure all tables exist
        await sql`CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT CHECK (role IN ('admin', 'sales')) DEFAULT 'sales',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`;

        await sql`CREATE TABLE IF NOT EXISTS companies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            category TEXT,
            city TEXT,
            address TEXT,
            website TEXT,
            rating FLOAT,
            reviews INTEGER,
            scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(name, address)
        )`;

        await sql`CREATE TABLE IF NOT EXISTS websites (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
            pagespeed_mobile INTEGER,
            pagespeed_desktop INTEGER,
            has_ssl BOOLEAN,
            is_mobile_friendly BOOLEAN,
            load_time FLOAT,
            uses_ads BOOLEAN,
            analysis_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`;

        await sql`CREATE TABLE IF NOT EXISTS owners (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
            owner_name TEXT,
            confidence FLOAT,
            source TEXT
        )`;

        await sql`CREATE TABLE IF NOT EXISTS contacts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
            phone TEXT,
            email TEXT,
            validated BOOLEAN DEFAULT FALSE
        )`;

        await sql`CREATE TABLE IF NOT EXISTS leads (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
            score INTEGER,
            status TEXT CHECK (status IN ('new', 'called', 'interested', 'not_interested', 'closed')) DEFAULT 'new',
            assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`;

        await sql`CREATE TABLE IF NOT EXISTS scan_status (
            id SERIAL PRIMARY KEY,
            category TEXT,
            current_city TEXT,
            total_towns INTEGER,
            completed_towns INTEGER DEFAULT 0,
            leads_found INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT FALSE,
            is_paused BOOLEAN DEFAULT FALSE,
            started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`;

        await sql`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`;

        // Migration: Ensure new column is_paused exists for previously created tables
        await sql`ALTER TABLE scan_status ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT FALSE`;

        for (const [key, value] of Object.entries(body)) {
            await sql`
        INSERT INTO settings (key, value)
        VALUES (${key}, ${value as string})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `;
        }

        return NextResponse.json({ message: 'Settings updated' });
    } catch (error: any) {
        console.error('Settings save error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Auto-migration: Ensure new columns exist before querying
    try {
      await sql`ALTER TABLE companies ADD COLUMN IF NOT EXISTS ico VARCHAR(20)`;
      await sql`ALTER TABLE owners ADD COLUMN IF NOT EXISTS source TEXT`;
      await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`;
      await sql`ALTER TABLE owners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`;
    } catch (migErr) {
      console.error('Migration error in /api/leads:', migErr);
    }

    const { rows } = await sql`
      SELECT 
        l.id,
        l.score,
        l.status,
        c.name as company,
        c.city,
        c.website,
        c.ico,
        w.pagespeed_mobile as "mobileSpeed",
        w.load_time as "loadTime",
        w.uses_ads as ads,
        o.owner_name as owner,
        o.source as owner_source,
        con.phone
      FROM leads l
      JOIN companies c ON l.company_id = c.id
      LEFT JOIN websites w ON c.id = w.company_id
      LEFT JOIN owners o ON c.id = o.company_id
      LEFT JOIN contacts con ON c.id = con.company_id
      ORDER BY l.created_at DESC
    `;

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT 
        l.id,
        l.score,
        l.status,
        c.name as company,
        c.city,
        c.website,
        w.pagespeed_mobile as "mobileSpeed",
        w.uses_ads as ads,
        o.owner_name as owner,
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

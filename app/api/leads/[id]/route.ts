import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { rows } = await sql`
      SELECT 
        l.id,
        l.score,
        l.status,
        l.notes,
        c.name,
        c.address,
        c.website,
        w.pagespeed_mobile as "mobileSpeed",
        w.pagespeed_desktop as "desktopSpeed",
        w.has_ssl as "hasSsl",
        w.uses_ads as "usesAds",
        o.owner_name as owner,
        con.phone
      FROM leads l
      JOIN companies c ON l.company_id = c.id
      LEFT JOIN websites w ON c.id = w.company_id
      LEFT JOIN owners o ON c.id = o.company_id
      LEFT JOIN contacts con ON c.id = con.company_id
      WHERE l.id = ${id}
      LIMIT 1
    `;

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

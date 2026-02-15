import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        const { rows } = await sql`
      SELECT * FROM scan_status 
      WHERE is_active = TRUE 
      OR updated_at > NOW() - INTERVAL '5 minutes'
      ORDER BY updated_at DESC 
      LIMIT 1
    `;

        if (rows.length === 0) {
            return NextResponse.json({ is_active: false });
        }

        return NextResponse.json(rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

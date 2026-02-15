import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
    try {
        const { rows } = await sql`
      UPDATE scan_status 
      SET is_paused = NOT is_paused, updated_at = NOW() 
      WHERE is_active = TRUE
      RETURNING is_paused
    `;

        if (rows.length === 0) {
            return NextResponse.json({ error: 'No active scan to pause' }, { status: 404 });
        }

        return NextResponse.json({ is_paused: rows[0].is_paused });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

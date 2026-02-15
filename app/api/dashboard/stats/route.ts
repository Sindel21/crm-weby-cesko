import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        const { rows: totalRows } = await sql`SELECT COUNT(*) FROM leads`;
        const { rows: newRows } = await sql`SELECT COUNT(*) FROM leads WHERE status = 'new'`;
        const { rows: calledRows } = await sql`SELECT COUNT(*) FROM leads WHERE status IN ('called', 'interested', 'closed')`;
        const { rows: closingRows } = await sql`
      SELECT 
        (COUNT(*) FILTER (WHERE status IN ('interested', 'closed'))::float / NULLIF(COUNT(*), 0) * 100) as rate 
      FROM leads
    `;

        return NextResponse.json({
            totalLeads: parseInt(totalRows[0].count),
            newLeads: parseInt(newRows[0].count),
            callsToday: parseInt(calledRows[0].count), // Simplified for MVP
            successRate: Math.round(closingRows[0].rate || 0) + '%',
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

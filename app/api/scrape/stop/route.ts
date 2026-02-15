import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
    try {
        await sql`DELETE FROM scan_status`;
        return NextResponse.json({ message: 'Scan stopped and cleared' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

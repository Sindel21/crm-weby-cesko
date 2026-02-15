import { NextResponse } from 'next/server';
import { findCompanyOwner } from '@/lib/ai';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
    try {
        const { companyId, name, city, address } = await req.json();

        if (!companyId || !name || !city || !address) {
            return NextResponse.json({ error: 'Company details are required' }, { status: 400 });
        }

        const enrichment = await findCompanyOwner(name, city, address);

        await sql`
      INSERT INTO owners (company_id, owner_name, confidence, source)
      VALUES (${companyId}, ${enrichment.owner_name}, ${enrichment.confidence}, ${enrichment.source_url})
    `;

        return NextResponse.json({ message: 'Enrichment complete' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

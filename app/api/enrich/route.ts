import { NextResponse } from 'next/server';
import { findCompanyOwner } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { companyId, name, city, address } = await req.json();

        if (!companyId || !name || !city || !address) {
            return NextResponse.json({ error: 'Company details are required' }, { status: 400 });
        }

        const enrichment = await findCompanyOwner(name, city, address);

        const { data, error } = await supabaseAdmin
            .from('owners')
            .insert({
                company_id: companyId,
                owner_name: enrichment.owner_name,
                confidence: enrichment.confidence,
                source: enrichment.source_url,
            })
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Enrichment complete', data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { calculateLeadScore } from '@/lib/scoring';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { companyId } = await req.json();

        if (!companyId) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        // Fetch website analysis
        const { data: websiteData, error: websiteError } = await supabaseAdmin
            .from('websites')
            .select('*')
            .eq('company_id', companyId)
            .single();

        if (websiteError || !websiteData) {
            return NextResponse.json({ error: 'Website analysis not found' }, { status: 404 });
        }

        const { score, isCallLead } = calculateLeadScore({
            pagespeed_mobile: websiteData.pagespeed_mobile,
            pagespeed_desktop: websiteData.pagespeed_desktop,
            has_ssl: websiteData.has_ssl,
            uses_ads: websiteData.uses_ads,
            is_modern: false, // Default for MVP or add logic
        });

        // Create lead if it's a call lead (or update existing)
        if (isCallLead) {
            const { data, error } = await supabaseAdmin
                .from('leads')
                .upsert({
                    company_id: companyId,
                    score: score,
                    status: 'new',
                })
                .select();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ message: 'Lead created/updated', data });
        }

        return NextResponse.json({ message: 'Not a lead', score });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

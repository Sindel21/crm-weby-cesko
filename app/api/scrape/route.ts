import { NextResponse } from 'next/server';
import { runScraper } from '@/lib/apify';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { city, category } = await req.json();

        if (!city || !category) {
            return NextResponse.json({ error: 'City and category are required' }, { status: 400 });
        }

        const companies = await runScraper(city, category);

        // Save to database
        const { data, error } = await supabaseAdmin
            .from('companies')
            .insert(companies.map(c => ({
                name: c.name,
                category: c.category,
                city: c.city,
                address: c.address,
                website: c.website,
                rating: c.rating,
                reviews: c.reviews
            })))
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: `Scraped ${companies.length} companies`, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

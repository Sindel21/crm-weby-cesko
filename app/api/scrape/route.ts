import { NextResponse } from 'next/server';
import { runScraper } from '@/lib/apify';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
    try {
        const { city, category } = await req.json();

        if (!city || !category) {
            return NextResponse.json({ error: 'City and category are required' }, { status: 400 });
        }

        const companies = await runScraper(city, category);

        // Save to database
        for (const c of companies) {
            await sql`
        INSERT INTO companies (name, category, city, address, website, rating, reviews)
        VALUES (${c.name}, ${c.category}, ${c.city}, ${c.address}, ${c.website}, ${c.rating}, ${c.reviews})
        ON CONFLICT (name, address) DO NOTHING
      `;
        }

        return NextResponse.json({ message: `Scraped ${companies.length} companies` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

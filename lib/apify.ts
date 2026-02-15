import { getSetting } from './db-settings';

export interface ApifyCompany {
    name: string;
    category: string;
    city: string;
    address: string;
    website: string;
    rating: number;
    reviews: number;
}

export const runScraper = async (city: string, category: string): Promise<ApifyCompany[]> => {
    const token = await getSetting('apify_token');

    if (!token) {
        throw new Error('Apify API token is not set. Please go to Settings and add your token.');
    }
    // This is a placeholder for actual Apify Actor call
    // Example: apify/google-maps-scraper

    const response = await fetch(`https://api.apify.com/v2/acts/apify~google-maps-scraper/runs?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            searchQueries: [`${category} in ${city}, Czech Republic`],
            maxResults: 10,
        })
    });

    const run = await response.json();
    console.log('Apify Run Response:', JSON.stringify(run));

    if (!response.ok || !run.data) {
        throw new Error(`Apify run failed: ${run.error?.message || response.statusText}`);
    }

    const datasetId = run.data.defaultDatasetId;

    // In a real scenario, we'd wait for completion or use a webhook.
    // For MVP, we'll assume we can poll or it's fast enough for small sets.
    // Here we just return empty or mock if not ready.

    const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`);
    const items = await datasetResponse.json();

    return items.map((item: any) => ({
        name: item.title,
        category: item.categoryName,
        city: item.city,
        address: item.address,
        website: item.website,
        rating: item.reviewsScore,
        reviews: item.reviewsCount,
    }));
};

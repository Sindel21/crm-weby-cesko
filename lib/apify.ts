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

    const response = await fetch(`https://api.apify.com/v2/acts/apify~google-maps-scraper/runs?token=${token}&waitForFinish=60`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            searchStrings: [`${category} in ${city}, Czech Republic`],
            maxCrawledPlacesPerSearch: 10,
        })
    });

    const run = await response.json();
    console.log('Apify Run Response:', JSON.stringify(run));

    // Fix: Apify returns data directly on the run object for this endpoint
    const datasetId = run.defaultDatasetId || run.data?.defaultDatasetId;

    if (!response.ok || !datasetId) {
        throw new Error(`Apify run failed: ${run.error?.message || response.statusText || 'Missing datasetId'}`);
    }

    // Wait 5 seconds for Apify to start producing results
    await new Promise(resolve => setTimeout(resolve, 5000));

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

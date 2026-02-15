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

    // Using the definitive alphanumeric ID for the official Google Maps Scraper
    const response = await fetch(`https://api.apify.com/v2/acts/nwua9Gu5YrADL7ZDj/runs?token=${token}&waitForFinish=60`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            searchStrings: [`${category} ${city}`],
            maxCrawledPlacesPerSearch: 10,
            language: 'cs',
            countryCode: 'cz'
        })
    });

    const run = await response.json();
    console.log(`Apify Run (${city}) Status:`, run.status || run.data?.status);

    const datasetId = run.defaultDatasetId || run.data?.defaultDatasetId;

    if (!datasetId) {
        console.error('Apify failed to provide datasetId. Response:', JSON.stringify(run));
        return [];
    }

    // Give it a moment to sync
    await new Promise(resolve => setTimeout(resolve, 2000));

    const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`);
    const items = await datasetResponse.json();

    console.log(`Dataset for ${city} has ${Array.isArray(items) ? items.length : 'NaN'} items`);
    if (Array.isArray(items) && items.length > 0) {
        console.log('First item sample:', JSON.stringify(items[0]).substring(0, 100));
    }

    return items.map((item: any) => ({
        name: item.title || item.name || item.businessName || 'Neznámá firma',
        category: item.categoryName || item.category || item.types?.[0] || 'Ostatní',
        city: item.city || city,
        address: item.address || item.fullAddress || item.full_address || '---',
        website: item.website || item.url || '',
        rating: item.reviewsScore || item.rating || item.totalScore || 0,
        reviews: item.reviewsCount || item.reviewsCount || item.review_count || 0,
    }));
};

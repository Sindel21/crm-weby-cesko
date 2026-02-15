const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

export interface PageSpeedResult {
    mobileScore: number;
    desktopScore: number;
    loadTime: number;
    isMobileFriendly: boolean;
}

export const analyzeWebsite = async (url: URL): Promise<PageSpeedResult> => {
    const apiKey = process.env.PAGESPEED_API_KEY;

    const fetchScore = async (strategy: 'mobile' | 'desktop') => {
        const response = await fetch(
            `${PAGESPEED_API_URL}?url=${encodeURIComponent(url.toString())}&strategy=${strategy}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.error) {
            throw new Error(`PageSpeed API error (${strategy}): ${data.error.message}`);
        }

        // Lighthouse score is 0-1, we want 0-100
        const score = Math.round(data.lighthouseResult.categories.performance.score * 100);
        const loadTime = data.lighthouseResult.audits['interactive']?.numericValue / 1000 || 0;

        return { score, loadTime };
    };

    const [mobileData, desktopData] = await Promise.all([
        fetchScore('mobile'),
        fetchScore('desktop'),
    ]);

    return {
        mobileScore: mobileData.score,
        desktopScore: desktopData.score,
        loadTime: mobileData.loadTime,
        isMobileFriendly: mobileData.score > 50, // Simplified heuristic
    };
};

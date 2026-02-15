export interface ScoringInput {
    pagespeed_mobile: number;
    pagespeed_desktop: number;
    has_ssl: boolean;
    uses_ads: boolean;
    is_modern?: boolean; // Optional, can be derived or passed
}

export const calculateLeadScore = (input: ScoringInput): { score: number; isCallLead: boolean } => {
    let score = 0;

    // Mobile PageSpeed < 50: +40
    if (input.pagespeed_mobile < 50) {
        score += 40;
    }

    // Desktop PageSpeed < 60: +20
    if (input.pagespeed_desktop < 60) {
        score += 20;
    }

    // Uses Google Ads: +40
    if (input.uses_ads) {
        score += 40;
    }

    // No modern web: +30 (if we can't detect, assume false for now or based on other factors)
    if (input.is_modern === false) {
        score += 30;
    }

    // No SSL: +20
    if (!input.has_ssl) {
        score += 20;
    }

    return {
        score,
        isCallLead: score >= 60,
    };
};

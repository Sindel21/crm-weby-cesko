export interface ScoringInput {
    pagespeed_mobile: number;
    pagespeed_desktop: number;
    has_ssl: boolean;
    uses_ads: boolean;
    is_modern?: boolean; // Optional, can be derived or passed
}

export const calculateLeadScore = (input: ScoringInput): { score: number; isCallLead: boolean } => {
    // Score is now exactly the same as PageSpeed mobile score as requested
    const score = input.pagespeed_mobile;

    return {
        score,
        isCallLead: score < 50, // Leads with low scores are prime candidates
    };
};

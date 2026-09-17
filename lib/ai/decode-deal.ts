export type Verdict = 'Take It' | 'Negotiate' | 'Walk Away';

const VERDICTS: Verdict[] = ['Take It', 'Negotiate', 'Walk Away'];

export type DealScoring = {
  verdict: Verdict;
  payFairness: number;
  rightsRisk: number;
  overallScore: number;
  redFlags: string[];
  worthEstimate: string;
  marketValue: string;
  rateComparison: string | null;
  recommendedCounterLow: number;
  recommendedCounterHigh: number;
  detectedOfferAmount: number | null;
  counterMessage: string;
};

export type RateCard = {
  ratePerVideo: number | null;
  ratePerPhoto: number | null;
  ratePerReel: number | null;
};

export type CreatorDetails = {
  followerCount: number;
  platform: string;
  niche: string;
  usualRate?: string;
  rateCard?: RateCard | null;
};

const SYSTEM_PROMPT = `You are an expert consultant for UGC (user-generated content) creators evaluating brand deal offers. You'll be given the creator's follower count, primary platform, content niche, optionally their usual rate(s), and the pasted text of a brand's offer, DM, or contract. Analyze all of this together and produce:

1. verdict: exactly one of "Take It", "Negotiate", or "Walk Away", based on the overall quality of the deal and how severe any red flags are.
2. Three scores from 1-100:
   - payFairness: how fair the offered pay is relative to current UGC market rates for this creator's follower tier, platform, and niche, given the deliverables requested. If the creator's own rate card is provided, weigh their actual rates more heavily than generic market averages.
   - rightsRisk: how risky the usage rights, exclusivity, and ownership terms are for the creator. Higher = SAFER for the creator (fewer or less restrictive rights taken), lower = riskier.
   - overallScore: the overall quality of the deal for the creator, considering pay and rights together.
3. redFlags: an array of specific risky clauses or terms found in the text, explained in plain English (e.g. "Grants the brand perpetual, worldwide usage rights with no extra pay for future use"). If there are none, return an empty array.
4. worthEstimate: a short, specific estimate of what THIS deal overall is worth, as a string.
5. marketValue: a short, specific fair rate range for a creator with this follower count, on this platform, in this niche, for the deliverables described in the offer (e.g. "$300-$500 per Reel for a 50K-100K follower beauty creator on Instagram"), as a string.
6. rateComparison: ONLY if the creator's own rate card (per-video/per-photo/per-reel rates) was provided below, a short sentence comparing this specific offer's implied pay to their usual rate(s) for the content types actually requested (e.g. "This is $150 below your usual $400 rate for a video."). If no rate card was provided, set this to null.
7. recommendedCounterLow and recommendedCounterHigh: a specific dollar range (two plain numbers, no symbols) the creator should counter-offer with for this whole deal, grounded in marketValue, payFairness, and the creator's own rate card if provided — not a vague suggestion.
8. detectedOfferAmount: the single total dollar amount the brand is offering to PAY the creator, as a plain number with no symbols, if one is clearly stated in the text (do not confuse this with product value, follower counts, or other numbers). If no clear payment amount is stated, set this to null. Do not guess.
9. counterMessage: a ready-to-send, friendly but firm message the creator could copy and paste back to the brand to negotiate a better deal. It MUST explicitly state the recommendedCounterLow-recommendedCounterHigh dollar range as the ask (e.g. "I'd need $X-$Y for this scope"), not a vague ask, and should reference anything unfair found above.

Respond with ONLY a JSON object with keys "verdict" (string), "payFairness" (number), "rightsRisk" (number), "overallScore" (number), "redFlags" (array of strings), "worthEstimate" (string), "marketValue" (string), "rateComparison" (string or null), "recommendedCounterLow" (number), "recommendedCounterHigh" (number), "detectedOfferAmount" (number or null), "counterMessage" (string).`;

export async function scoreDeal(
  offerText: string,
  creator: CreatorDetails
): Promise<DealScoring> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured on the server.');
  }

  const rateCardLines: string[] = [];
  if (creator.rateCard?.ratePerVideo != null) {
    rateCardLines.push(`- Usual rate per video: $${creator.rateCard.ratePerVideo}`);
  }
  if (creator.rateCard?.ratePerPhoto != null) {
    rateCardLines.push(`- Usual rate per photo: $${creator.rateCard.ratePerPhoto}`);
  }
  if (creator.rateCard?.ratePerReel != null) {
    rateCardLines.push(`- Usual rate per reel: $${creator.rateCard.ratePerReel}`);
  }

  const userContent = [
    'Creator details:',
    `- Follower count: ${creator.followerCount}`,
    `- Platform: ${creator.platform}`,
    `- Niche: ${creator.niche}`,
    creator.usualRate?.trim()
      ? `- Usual rate mentioned for this submission: ${creator.usualRate}`
      : null,
    ...rateCardLines,
    '',
    'Offer/DM/contract text:',
    offerText
  ]
    .filter((line) => line !== null)
    .join('\n');

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent }
      ]
    })
  });

  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text();
    console.error('OpenAI API error:', errorText);
    throw new Error('Failed to get a response from OpenAI.');
  }

  const data = await openaiResponse.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI returned an empty response.');
  }

  const parsed = JSON.parse(content);

  return {
    verdict: VERDICTS.includes(parsed.verdict) ? parsed.verdict : 'Negotiate',
    payFairness: Number(parsed.payFairness ?? 0),
    rightsRisk: Number(parsed.rightsRisk ?? 0),
    overallScore: Number(parsed.overallScore ?? 0),
    redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags.map(String) : [],
    worthEstimate: String(parsed.worthEstimate ?? ''),
    marketValue: String(parsed.marketValue ?? ''),
    rateComparison:
      parsed.rateComparison === null || parsed.rateComparison === undefined
        ? null
        : String(parsed.rateComparison),
    recommendedCounterLow: Number(parsed.recommendedCounterLow ?? 0),
    recommendedCounterHigh: Number(parsed.recommendedCounterHigh ?? 0),
    detectedOfferAmount:
      parsed.detectedOfferAmount === null || parsed.detectedOfferAmount === undefined
        ? null
        : Number(parsed.detectedOfferAmount),
    counterMessage: String(parsed.counterMessage ?? '')
  };
}

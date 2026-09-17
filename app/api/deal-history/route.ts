import { NextResponse } from 'next/server';
import { getUser, getDealDecodesForUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decodes = await getDealDecodesForUser(user.id);

  // "Recommended counter amount" is a range, so the midpoint stands in for
  // the single figure the savings estimate compares against the original offer.
  let estimatedExtraEarned = 0;
  for (const decode of decodes) {
    if (decode.originalOfferAmount !== null) {
      const midpoint =
        (decode.recommendedCounterLow + decode.recommendedCounterHigh) / 2;
      estimatedExtraEarned += midpoint - decode.originalOfferAmount;
    }
  }

  return NextResponse.json({
    totalDecoded: decodes.length,
    estimatedExtraEarned: Math.round(estimatedExtraEarned),
    recentDecodes: decodes.slice(0, 10).map((d) => ({
      date: d.createdAt,
      verdict: d.verdict,
      recommendedCounterLow: d.recommendedCounterLow,
      recommendedCounterHigh: d.recommendedCounterHigh,
      originalOfferAmount: d.originalOfferAmount
    }))
  });
}

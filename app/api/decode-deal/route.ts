import { NextResponse } from 'next/server';
import {
  getUser,
  ensureUsage,
  incrementUsage,
  getRateCard,
  createDealDecode
} from '@/lib/db/queries';
import { scoreDeal } from '@/lib/ai/decode-deal';
import { FREE_DECODE_LIMIT, hasUnlimitedDecodes } from '@/lib/usage';
import { PLATFORMS, NICHES } from '@/lib/creator-options';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const usage = await ensureUsage(user.id);
  const unlimited = hasUnlimitedDecodes(user.email);
  const decodesRemaining = unlimited
    ? null
    : Math.max(0, FREE_DECODE_LIMIT - usage.decodeCount);

  return NextResponse.json({
    decodesUsed: usage.decodeCount,
    decodesRemaining,
    limitReached: !unlimited && decodesRemaining !== null && decodesRemaining <= 0,
    unlimited
  });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { offerText, usualRate, followerCount, platform, niche } =
    await request.json();

  if (typeof offerText !== 'string' || !offerText.trim()) {
    return NextResponse.json(
      { error: "Paste the brand's offer, DM, or contract to decode." },
      { status: 400 }
    );
  }

  const followerCountNumber = Number(followerCount);
  if (!Number.isFinite(followerCountNumber) || followerCountNumber <= 0) {
    return NextResponse.json(
      { error: 'Enter a valid follower count.' },
      { status: 400 }
    );
  }

  if (!PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: 'Select a valid platform.' }, { status: 400 });
  }

  if (!NICHES.includes(niche)) {
    return NextResponse.json({ error: 'Select a valid content niche.' }, { status: 400 });
  }

  const usage = await ensureUsage(user.id);
  const unlimited = hasUnlimitedDecodes(user.email);
  if (!unlimited && usage.decodeCount >= FREE_DECODE_LIMIT) {
    return NextResponse.json(
      {
        error:
          "You've used all 3 free decodes. Upgrade to keep decoding deals.",
        upgradeRequired: true
      },
      { status: 402 }
    );
  }

  const rateCard = await getRateCard(user.id);

  let scoring;
  try {
    scoring = await scoreDeal(offerText, {
      followerCount: followerCountNumber,
      platform,
      niche,
      usualRate: typeof usualRate === 'string' ? usualRate : undefined,
      rateCard: rateCard
        ? {
            ratePerVideo: rateCard.ratePerVideo,
            ratePerPhoto: rateCard.ratePerPhoto,
            ratePerReel: rateCard.ratePerReel
          }
        : null
    });
  } catch (error) {
    console.error('Deal scoring error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to score deal.' },
      { status: 502 }
    );
  }

  const updatedUsage = await incrementUsage(user.id);
  const decodesRemaining = unlimited
    ? null
    : Math.max(0, FREE_DECODE_LIMIT - updatedUsage.decodeCount);

  await createDealDecode({
    userId: user.id,
    verdict: scoring.verdict,
    recommendedCounterLow: Math.round(scoring.recommendedCounterLow),
    recommendedCounterHigh: Math.round(scoring.recommendedCounterHigh),
    originalOfferAmount:
      scoring.detectedOfferAmount !== null
        ? Math.round(scoring.detectedOfferAmount)
        : null
  });

  return NextResponse.json({
    ...scoring,
    decodesUsed: updatedUsage.decodeCount,
    decodesRemaining
  });
}

import { NextResponse } from 'next/server';
import { getUser, getRateCard, upsertRateCard } from '@/lib/db/queries';

function toNullableRate(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateCard = await getRateCard(user.id);

  return NextResponse.json({
    ratePerVideo: rateCard?.ratePerVideo ?? null,
    ratePerPhoto: rateCard?.ratePerPhoto ?? null,
    ratePerReel: rateCard?.ratePerReel ?? null,
    isSet: rateCard !== null
  });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ratePerVideo, ratePerPhoto, ratePerReel } = await request.json();

  const updated = await upsertRateCard(user.id, {
    ratePerVideo: toNullableRate(ratePerVideo),
    ratePerPhoto: toNullableRate(ratePerPhoto),
    ratePerReel: toNullableRate(ratePerReel)
  });

  return NextResponse.json({
    ratePerVideo: updated.ratePerVideo,
    ratePerPhoto: updated.ratePerPhoto,
    ratePerReel: updated.ratePerReel,
    isSet: true
  });
}

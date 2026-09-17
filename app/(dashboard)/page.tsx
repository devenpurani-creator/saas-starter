'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Sparkles, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PLATFORMS, NICHES } from '@/lib/creator-options';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Verdict = 'Take It' | 'Negotiate' | 'Walk Away';

type DealResult = {
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
  counterMessage: string;
  decodesRemaining: number;
};

type UsageData = {
  decodesRemaining: number;
  limitReached: boolean;
};

type RateCardData = {
  ratePerVideo: number | null;
  ratePerPhoto: number | null;
  ratePerReel: number | null;
  isSet: boolean;
};

const VERDICT_STYLES: Record<Verdict, string> = {
  'Take It': 'bg-gradient-to-br from-emerald-500 to-teal-500',
  Negotiate: 'bg-gradient-to-br from-amber-400 to-orange-500',
  'Walk Away': 'bg-gradient-to-br from-rose-500 to-red-600'
};

const VERDICT_ICONS: Record<Verdict, typeof CheckCircle2> = {
  'Take It': CheckCircle2,
  Negotiate: AlertTriangle,
  'Walk Away': XCircle
};

export default function HomePage() {
  const { data: usage, mutate: mutateUsage } = useSWR<UsageData>(
    '/api/decode-deal',
    fetcher
  );

  const [followerCount, setFollowerCount] = useState('');
  const [platform, setPlatform] = useState('');
  const [niche, setNiche] = useState('');
  const [offerText, setOfferText] = useState('');
  const [usualRate, setUsualRate] = useState('');
  const [result, setResult] = useState<DealResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [copied, setCopied] = useState(false);

  const limitReached = usage?.limitReached ?? false;
  const canSubmit =
    offerText.trim() !== '' &&
    followerCount.trim() !== '' &&
    Number(followerCount) > 0 &&
    platform !== '' &&
    niche !== '' &&
    !limitReached;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch('/api/decode-deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerText,
          usualRate,
          followerCount,
          platform,
          niche
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setUnauthorized(true);
          throw new Error('Please sign in to decode a deal.');
        }
        if (res.status === 402) {
          throw new Error(data.error || "You've used all your free decodes.");
        }
        throw new Error(data.error || 'Something went wrong.');
      }
      setResult(data);
      mutateUsage();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function copyCounterMessage() {
    if (!result) return;
    navigator.clipboard
      .writeText(result.counterMessage)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setError('Could not copy automatically — please select and copy the text manually.');
      });
  }

  const VerdictIcon = result ? VERDICT_ICONS[result.verdict] : null;

  return (
    <div className="bg-gradient-to-b from-violet-50 via-white to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        <div className="mb-8 sm:mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-violet-200 shadow-sm px-3 py-1 text-xs font-semibold text-violet-700 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Deal Analysis
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
            UGC{' '}
            <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
              Deal Decoder
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto sm:mx-0 text-base sm:text-lg">
            Paste a brand's offer, DM, or contract and get an instant read on
            whether the pay is fair, how risky the rights terms are, and a
            ready-to-send counter-message.
          </p>
        </div>

        <RateCardSetup />

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">The Offer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid sm:grid-cols-3 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Follower count
                  </span>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 50000"
                    value={followerCount}
                    onChange={(e) => setFollowerCount(e.target.value)}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Platform
                  </span>
                  <select
                    className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs h-9"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Content niche
                  </span>
                  <select
                    className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs h-9"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {NICHES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Paste the brand's offer, DM, or contract here
                </span>
                <Textarea
                  rows={14}
                  placeholder="Paste the full message or contract text..."
                  value={offerText}
                  onChange={(e) => setOfferText(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Your usual rate per video (optional, helps us judge if this
                  offer is fair)
                </span>
                <Input
                  type="text"
                  placeholder="e.g. $500"
                  value={usualRate}
                  onChange={(e) => setUsualRate(e.target.value)}
                />
              </label>

              <Button
                onClick={handleSubmit}
                disabled={loading || !canSubmit}
                className="bg-gradient-to-r from-violet-600 to-pink-500 text-white hover:opacity-90 disabled:opacity-50 disabled:from-gray-300 disabled:to-gray-300"
              >
                {loading ? 'Decoding...' : 'Decode This Deal'}
              </Button>

              {usage && !limitReached && (
                <p className="text-xs text-gray-500">
                  {usage.decodesRemaining} free decode
                  {usage.decodesRemaining === 1 ? '' : 's'} remaining
                </p>
              )}

              {limitReached && (
                <p className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-md px-3 py-2">
                  You've used all 3 free decodes. Upgrading to keep decoding
                  deals isn't available yet in this version &mdash; check back
                  soon.
                </p>
              )}

              {error && (
                <p className="text-sm text-red-600">
                  {error}
                  {unauthorized && (
                    <>
                      {' '}
                      <Link href="/sign-in" className="underline">
                        Sign in
                      </Link>
                    </>
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            {!result && !loading && (
              <Card>
                <CardContent className="py-10 text-center text-sm text-gray-500">
                  Your deal score, red flags, and counter-message will show up
                  here.
                </CardContent>
              </Card>
            )}

            {loading && (
              <Card>
                <CardContent className="py-10 text-center text-sm text-gray-500">
                  Decoding...
                </CardContent>
              </Card>
            )}

            {result && VerdictIcon && (
              <>
                <div
                  className={`rounded-2xl shadow-lg px-6 py-8 sm:py-10 text-center text-white ${VERDICT_STYLES[result.verdict]}`}
                >
                  <VerdictIcon className="mx-auto h-9 w-9 sm:h-10 sm:w-10 mb-2" />
                  <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
                    Verdict
                  </p>
                  <p className="text-4xl sm:text-5xl font-extrabold mt-1">
                    {result.verdict}
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <ScoreCard label="Pay Fairness" score={result.payFairness} />
                      <ScoreCard label="Rights Risk" score={result.rightsRisk} />
                      <ScoreCard
                        label="Overall Deal Score"
                        score={result.overallScore}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Red Flags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.redFlags.length === 0 ? (
                      <p className="text-sm text-gray-700">
                        No red flags found &mdash; this looks like a clean
                        offer.
                      </p>
                    ) : (
                      <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                        {result.redFlags.map((flag, i) => (
                          <li key={i}>{flag}</li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      What This Deal Is Actually Worth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {result.worthEstimate}
                    </p>
                    {result.rateComparison && (
                      <p className="mt-3 pt-3 border-t border-gray-200 text-sm font-medium text-gray-700">
                        {result.rateComparison}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Market Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {result.marketValue}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Recommended Counter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
                      ${result.recommendedCounterLow.toLocaleString()} &ndash; $
                      {result.recommendedCounterHigh.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Counter-Message</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {result.counterMessage}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="self-start"
                      onClick={copyCounterMessage}
                    >
                      {copied ? 'Copied!' : 'Copy Message'}
                    </Button>
                  </CardContent>
                </Card>

                <p className="text-xs text-gray-400">
                  This is general guidance, not legal advice.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function RateCardSetup() {
  const { data: rateCard, mutate } = useSWR<RateCardData>(
    '/api/rate-card',
    fetcher
  );

  const [editing, setEditing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [video, setVideo] = useState('');
  const [photo, setPhoto] = useState('');
  const [reel, setReel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (rateCard) {
      setVideo(rateCard.ratePerVideo?.toString() ?? '');
      setPhoto(rateCard.ratePerPhoto?.toString() ?? '');
      setReel(rateCard.ratePerReel?.toString() ?? '');
    }
  }, [rateCard]);

  if (!rateCard) return null;

  async function save() {
    setSaving(true);
    try {
      await fetch('/api/rate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ratePerVideo: video,
          ratePerPhoto: photo,
          ratePerReel: reel
        })
      });
      await mutate();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (rateCard.isSet && !editing) {
    return (
      <Card className="mb-8">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="text-sm text-gray-700">
            Your rates:
            {rateCard.ratePerVideo !== null && <> ${rateCard.ratePerVideo}/video</>}
            {rateCard.ratePerPhoto !== null && <> &middot; ${rateCard.ratePerPhoto}/photo</>}
            {rateCard.ratePerReel !== null && <> &middot; ${rateCard.ratePerReel}/reel</>}
          </p>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit Rate Card
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!rateCard.isSet && dismissed && !editing) return null;

  return (
    <Card className="mb-8 border-violet-200 bg-violet-50">
      <CardHeader>
        <CardTitle className="text-base">
          Set Up Your Rate Card (optional)
        </CardTitle>
        <p className="text-sm text-gray-600">
          Tell us your usual rates so we can compare offers against what YOU
          actually charge, not just market averages.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              Per video
            </span>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 400"
              value={video}
              onChange={(e) => setVideo(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              Per photo
            </span>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 150"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              Per reel
            </span>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 500"
              value={reel}
              onChange={(e) => setReel(e.target.value)}
            />
          </label>
        </div>
        <div className="flex gap-3">
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save Rate Card'}
          </Button>
          {!rateCard.isSet && (
            <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
              Skip for now
            </Button>
          )}
          {rateCard.isSet && (
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 sm:p-4 text-center">
      <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
        {score}
      </div>
      <div className="mt-1 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

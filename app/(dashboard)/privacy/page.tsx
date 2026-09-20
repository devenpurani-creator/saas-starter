import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Deal Decoder'
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: September 20, 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <p>
            UGC Deal Decoder ("Deal Decoder," "we," "us") helps creators evaluate
            brand deal offers. This policy explains what information we collect
            when you use the app, why we collect it, where it&apos;s stored, and
            who else sees it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            What we collect
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account information:</strong> your email address and a
              hashed password, so you can sign in and we can identify your
              account.
            </li>
            <li>
              <strong>Deal content you submit:</strong> the brand offer, DM, or
              contract text you paste in, along with the follower count,
              platform, niche, and optional rate card you provide, so the app
              can analyze the deal.
            </li>
            <li>
              <strong>Decode results:</strong> the verdict, scores, market
              value estimate, recommended counter-offer range, and
              counter-message generated for each deal you decode, so you can
              see your Deal History and track how many free decodes
              you&apos;ve used.
            </li>
            <li>
              <strong>Basic usage analytics:</strong> aggregated, anonymized
              page-view and performance data collected automatically by
              Vercel Analytics. This does not include the content of your
              offers or decode results.
            </li>
            <li>
              <strong>Billing information</strong> (only if you subscribe to a
              paid plan): payment details are collected and processed
              directly by Stripe, our payment processor — we do not store
              your card details ourselves.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Why we collect it
          </h2>
          <p>
            We use this information solely to operate Deal Decoder: to create
            and secure your account, to run the deal analysis you request, to
            show your past decodes and enforce free-tier usage limits, to
            process payment for paid plans, and to understand overall app
            usage so we can improve it. We do not use your data for
            advertising, and we do not build profiles about you beyond what&apos;s
            needed to run the app.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Where it&apos;s stored
          </h2>
          <p>
            Your account data, submitted deal text, and decode results are
            stored in our Supabase-hosted Postgres database. Access is
            restricted to what the app needs to function.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Third parties who receive your data
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>OpenAI:</strong> when you decode a deal, the offer/DM
              text you paste, along with your follower count, platform,
              niche, and rate card (if provided), is sent to OpenAI&apos;s API to
              generate the analysis and counter-message. OpenAI processes this
              text as a third-party service provider under its own API data
              usage terms.
            </li>
            <li>
              <strong>Stripe:</strong> if you subscribe to a paid plan, Stripe
              processes your payment details directly; we only receive
              subscription status, not your full card number.
            </li>
            <li>
              <strong>Vercel Analytics:</strong> collects aggregated,
              privacy-friendly usage analytics (e.g. page views) to help us
              understand traffic. It does not receive your offer text or
              decode results.
            </li>
          </ul>
          <p className="mt-3">
            We do not sell your personal data or your submitted deal content
            to anyone, for any purpose.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Cookies
          </h2>
          <p>
            We use a single essential cookie to keep you signed in. We don&apos;t
            use tracking or advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Your choices &amp; account deletion
          </h2>
          <p>
            You can stop using Deal Decoder at any time. To request deletion
            of your account and the deal content and results associated with
            it, email{' '}
            <a
              href="mailto:devenpurani@gmail.com"
              className="text-violet-600 hover:underline"
            >
              devenpurani@gmail.com
            </a>{' '}
            from the email address on your account, and we&apos;ll delete your
            data within a reasonable time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            AI-generated content disclaimer
          </h2>
          <p>
            Deal Decoder&apos;s verdicts, scores, market value estimates, counter-
            offer ranges, and counter-messages are generated by an AI model
            and can be inaccurate, outdated, or miss important context in
            your specific situation. This output is provided for general
            informational purposes only and is <strong>not</strong> professional
            legal, financial, or business advice. Always use your own
            judgment, and consult a qualified professional before making
            decisions based on a brand deal.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Changes to this policy
          </h2>
          <p>
            If we make material changes to this policy, we&apos;ll update the
            "Last updated" date above. Continued use of Deal Decoder after
            changes take effect means you accept the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Contact</h2>
          <p>
            Questions about this policy? Email{' '}
            <a
              href="mailto:devenpurani@gmail.com"
              className="text-violet-600 hover:underline"
            >
              devenpurani@gmail.com
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link href="/" className="text-sm text-violet-600 hover:underline">
          &larr; Back to Deal Decoder
        </Link>
      </div>
    </main>
  );
}

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Deal Decoder. All rights reserved.
        </p>
        <nav className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}

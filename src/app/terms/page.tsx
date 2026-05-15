import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | My Book Notes",
  description: "My Book Notes terms of service",
};

const lastUpdated = "May 16, 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <header className="mb-10">
          <div className="mb-4 flex items-center gap-3 text-blue-600 dark:text-blue-400">
            <FileText className="h-8 w-8" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Terms of Service
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Effective and last updated: {lastUpdated}
          </p>
        </header>

        <div className="space-y-8 leading-7 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using My Book Notes, you agree to these Terms of
              Service. If you do not agree to these terms, do not use the
              service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              2. Service Description
            </h2>
            <p>
              My Book Notes helps you view your Google Play Books and Google
              Books library, highlights, personal notes, chapter metadata, page
              offsets, and book-level notes after you sign in with your Google
              account.
            </p>
            <p className="mt-3">
              The service uses Google APIs to retrieve book and annotation data
              and to store app data files in Google Drive for syncing between
              sessions.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              3. Your Responsibilities
            </h2>
            <p>You are responsible for:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Using the service only for lawful purposes</li>
              <li>Keeping your Google account secure</li>
              <li>Managing the books, highlights, notes, and files you create or sync</li>
              <li>Complying with Google&apos;s applicable terms and policies</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              4. Google Services and Third-Party Terms
            </h2>
            <p>
              My Book Notes depends on Google sign-in, Google Books, Google
              Play Books, and Google Drive. Your use of those services remains
              subject to Google&apos;s terms, policies, and account settings.
            </p>
            <p className="mt-3">
              We are not responsible for changes, outages, data limitations, or
              access restrictions in third-party services that affect how My
              Book Notes works.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              5. Data and Content
            </h2>
            <p>
              Your book data, highlights, personal notes, chapter data, page
              offsets, and synced files remain your responsibility. The service
              is intended as a personal viewing and organization tool.
            </p>
            <p className="mt-3">
              You grant My Book Notes permission to process your data only as
              needed to provide the service, including displaying your library
              and notes and syncing app data through Google Drive.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              6. Availability and Changes
            </h2>
            <p>
              The service is provided on an as-is and as-available basis. We may
              update, suspend, or discontinue any part of the service at any
              time.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              7. No Warranty
            </h2>
            <p>
              To the fullest extent permitted by law, My Book Notes makes no
              warranties about the service, including warranties that it will be
              uninterrupted, error-free, secure, or suitable for your particular
              needs.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              8. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, My Book Notes will not be
              liable for indirect, incidental, special, consequential, or
              punitive damages, or for loss of data, access, profits, or
              goodwill arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              9. Contact
            </h2>
            <p>
              For questions about these terms, contact jina0605@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

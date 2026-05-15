import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | My Book Notes",
  description: "My Book Notes privacy policy",
};

const lastUpdated = "May 16, 2026";

export default function PrivacyPage() {
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
            <ShieldCheck className="h-8 w-8" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Privacy Policy
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Effective and last updated: {lastUpdated}
          </p>
        </header>

        <div className="space-y-8 leading-7 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              1. Information We Collect
            </h2>
            <p>
              My Book Notes uses Google sign-in to authenticate
              users and provide the service. During sign-in, we may process
              basic Google account profile information such as your name, email
              address, and profile image.
            </p>
            <p className="mt-3">
              When you use the service, we retrieve Google Books and Google
              Play Books library data through the Google Books API, including
              your purchased books, book metadata, highlights, notes, and page
              information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              2. Google API Scopes
            </h2>
            <p>
              This service uses Google OAuth and requests the following scopes:
              basic sign-in information (openid, email, profile), access to
              Google Books data, and permission to create and update Google
              Drive files.
            </p>
            <p className="mt-3">
              Google Drive API access is used to find, create, read, and update
              service data files in your Google Drive. The service does not use
              this permission to arbitrarily read all files in your Drive. It
              stores and syncs app data in files created by this app, including
              files in the app's "my-book-notes" folder.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              3. How We Use Information
            </h2>
            <p>We use the information we collect or retrieve only to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Authenticate you with your Google account and maintain your session</li>
              <li>Display your purchased books</li>
              <li>Show, search, and filter highlights and notes by book</li>
              <li>Store and sync chapter data, page offsets, and book-level notes</li>
              <li>Diagnose service errors and maintain basic security</li>
            </ul>
            <p className="mt-3">
              We do not use Google user data for advertising, and we do not use
              it to train AI or machine learning models.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              4. Storage and Retention
            </h2>
            <p>
              Chapter data, page offsets, and book-level notes may be cached in
              your browser localStorage and synced as JSON files in the
              "my-book-notes" folder in your Google Drive. This data is created
              by you or generated while you use the service.
            </p>
            <p className="mt-3">
              OAuth tokens and authentication session cookies are processed
              through the NextAuth session and token flow to maintain
              authentication and call Google APIs. They are processed only as
              long as needed to provide the service. Stored app data in
              localStorage is not automatically deleted when you sign out. You
              can remove locally cached app data by clearing your browser
              storage, and you can remove synced app data by deleting the
              related files from Google Drive.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              5. Sharing and Third-Party Services
            </h2>
            <p>
              We do not sell your personal information or share it with third
              parties beyond what is necessary to provide the service.
            </p>
            <p className="mt-3">
              This service uses Google services for sign-in, Google Books data,
              Google Drive file storage and sync, Google Play Books reader
              links, and book cover images served from Google Books. Google's
              privacy policy and API terms apply to those interactions.
            </p>
            <p className="mt-3">
              This app's use and transfer of information received from Google
              APIs adheres to the Google API Services User Data Policy,
              including the Limited Use requirements.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              6. Your Choices
            </h2>
            <p>
              You can revoke this service's Google API access at any time from
              your Google account permissions page. The app does not currently
              provide built-in controls for deleting locally cached data or
              synced Drive files. You can remove locally cached app data by
              clearing this site's browser storage, and you can remove synced
              app data by deleting the "my-book-notes" folder or related files
              from your Google Drive.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              7. Contact
            </h2>
            <p>
              For questions about privacy or data handling, contact
              jina0605@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

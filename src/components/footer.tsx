import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>Google Books Memo Viewer</p>
        <Link
          href="/privacy"
          className="font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}

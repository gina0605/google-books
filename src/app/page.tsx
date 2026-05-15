"use client";

import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { BookOpen, LogOut, User } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ redirect: false });
    }
  }, [session?.error]);

  if (status === "loading" || session?.error === "RefreshAccessTokenError") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-gray-50 dark:bg-gray-900">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800 dark:text-gray-100 flex items-center gap-4 text-center">
          <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-blue-500 flex-shrink-0" />
          My Book Notes
        </h1>

        {session ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-md">
            <div className="flex items-center gap-4 mb-6">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-12 h-12 rounded-full border border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="text-blue-500 w-6 h-6" />
                </div>
              )}
              <div>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Welcome, {session.user?.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {session.user?.email}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                Go to Library
              </button>
              <button
                onClick={() => signOut()}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center max-w-md">
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Sign in with your Google account to see the books you've read and the memos you've made.
            </p>
            <button
              onClick={() => signIn("google")}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

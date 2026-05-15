"use client";

import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";

interface SessionExpiredCardProps {
  callbackUrl?: string;
  message?: string;
}

export function SessionExpiredCard({
  callbackUrl = "/dashboard",
  message = "Your Google session has expired. Please sign in again.",
}: SessionExpiredCardProps) {
  const [isSigningOut, setIsSigningOut] = useState(true);

  useEffect(() => {
    let isMounted = true;

    signOut({ redirect: false }).finally(() => {
      if (isMounted) {
        setIsSigningOut(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignIn = async () => {
    if (isSigningOut) {
      await signOut({ redirect: false });
    }

    signIn("google", { callbackUrl });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-red-200 dark:border-red-900 max-w-md text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Session Expired
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isSigningOut}
          className="inline-block bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-wait text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          {isSigningOut ? "Preparing Sign In..." : "Sign In Again"}
        </button>
      </div>
    </div>
  );
}

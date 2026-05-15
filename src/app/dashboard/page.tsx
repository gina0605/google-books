import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchReadBooks } from "@/lib/books";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, User } from "lucide-react";
import { SessionExpiredCard } from "@/components/session-expired-card";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    redirect("/");
  }

  try {
    const books = await fetchReadBooks(session.accessToken);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 md:pt-6">
        <header className="max-w-7xl mx-auto flex flex-row sm:justify-between items-center gap-4 mb-4 md:mb-8">
          <Link href="/" className="flex flex-grow items-center gap-2 text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
            <BookOpen className="text-blue-500" />
            <span>My Reading Library</span>
          </Link>

          <div className="flex items-center gap-4">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt="Profile"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="text-blue-500 w-5 h-5" />
              </div>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 md:mb-8">
            Your Purchased Books
          </h2>

          {books.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-xl text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No books found in your "Purchased" bookshelf.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {books.map((book) => (
                <Link
                  key={book.id}
                  href={`/dashboard/book/${book.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 flex flex-col"
                >
                  <div className="aspect-[2/3] relative overflow-hidden bg-gray-200">
                    {book.thumbnail ? (
                      <Image
                        src={book.thumbnail}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                        <BookOpen className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 line-clamp-2 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {book.authors.join(", ")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  } catch (error: any) {
    console.error("Dashboard error:", error);
    const isUnauthorized = error.status === 401;

    if (isUnauthorized) {
      return (
        <SessionExpiredCard
          callbackUrl="/dashboard"
          message="Your Google session has expired. Please sign in again to access your library."
        />
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-red-200 dark:border-red-900 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            API Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            There was a problem fetching your books. This might be due to API limits or a network issue.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }
}

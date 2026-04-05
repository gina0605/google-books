import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchAnnotations, fetchReadBooks } from "@/lib/books";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Calendar, MessageSquare } from "lucide-react";
import { AnnotationsList } from "@/components/annotations-list";

interface BookPageProps {
  params: {
    id: string;
  };
}

export default async function BookDetailPage({ params }: BookPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    redirect("/");
  }

  try {
    const books = await fetchReadBooks(session.accessToken);
    const book = books.find((b) => b.id === params.id);

    if (!book) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-bold mb-4">Book Not Found</h2>
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      );
    }

    const annotations = await fetchAnnotations(session.accessToken, book.id);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:pt-6">
        <header className="max-w-4xl mx-auto mb-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors mb-4 md:mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-32 h-48 md:w-40 md:h-60 relative flex-shrink-0 shadow-md rounded-lg overflow-hidden bg-gray-200 mx-auto md:mx-0">
              {book.thumbnail ? (
                <Image
                  src={book.thumbnail}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {book.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-2 md:mb-4">
                {book.authors.join(", ")}
              </p>
              {book.acquiredDate && 
                <div className="space-y-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Purchased: {new Date(book.acquiredDate).toLocaleDateString("ko-KR")}</span>
                  </div>
                </div>}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto">
          {annotations.length === 0 ? (
            <>
              <div className="flex items-center justify-between mb-2 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <MessageSquare className="text-blue-500" />
                  Memos
                </h2>
              </div>
              <div className="bg-white dark:bg-gray-800 p-12 rounded-xl text-center border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">
                  No memos found for this book.
                </p>
              </div>
            </>
          ) : (
            <AnnotationsList annotations={annotations} volumeId={book.id} />
          )}
        </main>
      </div>
    );
  } catch (error: any) {
    console.error("Book detail error:", error);
    const isUnauthorized = error.status === 401;

    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-red-200 dark:border-red-900 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {isUnauthorized ? "Session Expired" : "Error"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {isUnauthorized 
              ? "Your Google session has expired. Please sign in again."
              : "There was a problem fetching the book details or memos."}
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            {isUnauthorized ? "Sign In Again" : "Back to Dashboard"}
          </Link>
        </div>
      </div>
    );
  }
}

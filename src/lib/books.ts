export interface Book {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string;
  publishedDate?: string;
  acquiredDate?: string;
  description?: string;
  isbn?: string;
}

export interface Annotation {
  id: string;
  volumeId: string;
  textSnippet?: string;
  note?: string;
  updated: string;
  pageId?: string;
  pageNumber?: string;
  highlightStyle?: string;
}

const GOOGLE_BOOKS_API_BASE = "https://www.googleapis.com/books/v1";

export async function fetchReadBooks(accessToken: string): Promise<Book[]> {
  console.log("Fetching purchased books from Bookshelf ID 7...");
  const response = await fetch(
    `${GOOGLE_BOOKS_API_BASE}/mylibrary/bookshelves/7/volumes`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Error fetching purchased books:", {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    // Create a specific error for unauthorized access
    const error = new Error(`Failed to fetch purchased books: ${response.statusText}`);
    (error as any).status = response.status;
    throw error;
  }

  const data = await response.json();
  console.log(`Successfully fetched ${data.totalItems || 0} items from Purchased shelf.`);
  
  if (!data.items) return [];

  return data.items.map((item: any) => {
    const isbns = item.volumeInfo.industryIdentifiers || [];
    const isbn13 = isbns.find((id: any) => id.type === "ISBN_13")?.identifier;
    const isbn10 = isbns.find((id: any) => id.type === "ISBN_10")?.identifier;

    return {
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
      thumbnail: item.volumeInfo.imageLinks?.thumbnail,
      publishedDate: item.volumeInfo.publishedDate,
      acquiredDate: item.userInfo?.acquiredTime,
      description: item.volumeInfo.description,
      isbn: isbn13 || isbn10,
    };
  });
}

// Helper to extract page number from Google's pageIds (e.g., "PT20" -> "18")
function extractPageNumber(pageIds: string[] | undefined): string | undefined {
  if (!pageIds || pageIds.length === 0) return undefined;

  const match = pageIds[0].match(/[A-Z]+(\d+)/);
  return match ? match[1] : undefined;
}

export async function fetchAnnotations(
  accessToken: string,
  volumeId?: string
): Promise<Annotation[]> {
  let url = `${GOOGLE_BOOKS_API_BASE}/mylibrary/annotations`;
  if (volumeId) {
    url += `?volumeId=${volumeId}`;
  }

  console.log(`Fetching annotations${volumeId ? ` for volume ${volumeId}` : ""}...`);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Error fetching annotations:", {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    // Create a specific error for unauthorized access
    const error = new Error(`Failed to fetch annotations: ${response.statusText}`);
    (error as any).status = response.status;
    throw error;
  }

  const data = await response.json();
  console.log(`Successfully fetched ${data.totalItems || 0} total annotations from API.`);

  if (!data.items) return [];

  /*
  console.log(data.items[0]);
  data.items.forEach((item: any) => {
    if(item.deleted) console.log(item);
  });
  */

  const annotations: Annotation[] = data.items
    .filter((item: any) => item.deleted !== true) // Filter out deleted annotations
    .map((item: any) => {
      let noteText = item.data?.trim();
      
      // If the note is a JSON string like {"note": "my text"}, extract the text
      if (noteText && noteText.startsWith('{')) {
        try {
          const parsed = JSON.parse(noteText);
          if (parsed.note) {
            noteText = parsed.note;
          }
        } catch (e) {
          // If parsing fails, keep the original text
          console.warn("Failed to parse note JSON:", noteText);
        }
      }

      return {
        id: item.id,
        volumeId: item.volumeId,
        textSnippet: item.selectedText?.trim(),
        note: noteText,
        updated: item.updated,
        pageId: item.currentVersionRanges?.gbTextRange?.startPosition,
        pageNumber: extractPageNumber(item.pageIds), // Capture the parsed number
        highlightStyle: item.highlightStyle,
      };
    })
    // Filter out annotations that have neither a highlight (textSnippet) nor a user note (note)
    // This removes bookmarks or other non-content annotations
    .filter((a: Annotation) => a.textSnippet || a.note)
    .sort((a : Annotation, b : Annotation) => {
      // 1. Sort by pageNumber (numerically)
      const pA = a.pageNumber ? parseInt(a.pageNumber) : Infinity;
      const pB = b.pageNumber ? parseInt(b.pageNumber) : Infinity;
      if (pA !== pB) return pA - pB;

      // 2. If pageNumbers are the same, sort by pageId (startPosition)
      const idA = a.pageId || "";
      const idB = b.pageId || "";
      return idA.localeCompare(idB);
    });

  console.log(`Filtered and sorted ${annotations.length} content-rich annotations (memos).`);

  return annotations;
}

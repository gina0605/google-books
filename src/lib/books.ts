export interface Book {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string;
  publishedDate?: string;
  description?: string;
  isbn?: string;
}

export interface TOCItem {
  title: string;
  level: number;
  pagenum: string;
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
      description: item.volumeInfo.description,
      isbn: isbn13 || isbn10,
    };
  });
}

// Helper to extract page number from Google's CfiRange (e.g., "/74[PA26]/2/10/84:0" -> "37")
function extractPageNumber(cfiRange: string | undefined): string | undefined {
  if (!cfiRange) return undefined;

  const match = cfiRange.match(/\/(\d+)/);
  return match ? String(Number(match[1]) / 2) : undefined;
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

  const annotations: Annotation[] = data.items
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
        pageNumber: extractPageNumber(item.currentVersionRanges?.imageCfiRange?.startPosition), // Capture the parsed number
        highlightStyle: item.highlightStyle,
      };
    })
    // Filter out annotations that have neither a highlight (textSnippet) nor a user note (note)
    // This removes bookmarks or other non-content annotations
    .filter((a: Annotation) => a.textSnippet || a.note);

  console.log(`Filtered to ${annotations.length} content-rich annotations (memos/highlights).`);

  return annotations;
}

export async function fetchTableOfContents(isbn: string): Promise<TOCItem[]> {
  console.log(`Fetching TOC from Open Library for ISBN: ${isbn}...`);
  try {
    const response = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=details&format=json`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];

    const data = await response.json();
    const bibKey = `ISBN:${isbn}`;
    const bookData = data[bibKey];
    
    if (!bookData || !bookData.details || !bookData.details.table_of_contents) {
      console.log(`No TOC found in Open Library for ISBN: ${isbn}`);
      return [];
    }

    const toc = bookData.details.table_of_contents.map((item: any) => ({
      title: item.title || item.label || "Untitled Chapter",
      level: item.level || 0,
      pagenum: item.pagenum || "",
    }));

    console.log(`Found ${toc.length} TOC items.`);
    return toc;
  } catch (error) {
    console.error("Error fetching TOC from Open Library:", error);
    return [];
  }
}

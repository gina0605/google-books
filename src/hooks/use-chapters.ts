import { useState, useEffect } from "react";

export interface Chapter {
  id: string;
  title: string;
  startPage: number;
}

export function useChapters(volumeId: string) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `google_books_chapters_${volumeId}`;

  // Load chapters from localStorage on mount
  useEffect(() => {
    const savedChapters = localStorage.getItem(storageKey);
    if (savedChapters) {
      try {
        setChapters(JSON.parse(savedChapters));
      } catch (e) {
        console.error("Failed to parse saved chapters:", e);
      }
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save chapters to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(storageKey, JSON.stringify(chapters));
    }
  }, [chapters, isLoaded, storageKey]);

  const addChapter = (title: string, startPage: number) => {
    const newChapter: Chapter = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      startPage,
    };
    setChapters((prev) => [...prev, newChapter].sort((a, b) => a.startPage - b.startPage));
  };

  const removeChapter = (id: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    chapters,
    addChapter,
    removeChapter,
    isLoaded,
  };
}

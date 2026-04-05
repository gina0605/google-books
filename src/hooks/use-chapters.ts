import { useState, useEffect, useCallback, useRef } from "react";

export interface Chapter {
  id: string;
  title: string;
  startPage: number;
}

interface LocalStorageData {
  chapters: Chapter[];
  lastSynced: string | null;
}

export function useChapters(volumeId: string) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const storageKey = `google_books_chapters_${volumeId}`;
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    let initialLastSynced: string | null = null;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration check: if parsed is an array, it's the old format
        if (Array.isArray(parsed)) {
          setChapters(parsed);
        } else if (parsed.chapters) {
          setChapters(parsed.chapters);
          initialLastSynced = parsed.lastSynced;
        }
      } catch (e) {
        console.error("Failed to parse saved chapters:", e);
      }
    }
    setIsLoaded(true);

    // Background sync from Google Drive
    const syncFromDrive = async () => {
      setIsSyncing(true);
      try {
        const url = `/api/chapters/${volumeId}${initialLastSynced ? `?lastSynced=${initialLastSynced}` : ""}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (!data.upToDate) {
            setChapters(data.chapters);
            localStorage.setItem(
              storageKey,
              JSON.stringify({
                chapters: data.chapters,
                lastSynced: data.lastSynced,
              })
            );
          }
        }
      } catch (e) {
        console.error("Failed to sync chapters from Drive:", e);
      } finally {
        setIsSyncing(false);
      }
    };

    syncFromDrive();
  }, [volumeId, storageKey]);

  // Function to save to Drive (debounced)
  const saveToDrive = useCallback(
    async (updatedChapters: Chapter[]) => {
      setIsSyncing(true);
      try {
        const response = await fetch(`/api/chapters/${volumeId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedChapters),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              chapters: updatedChapters,
              lastSynced: data.lastSynced,
            })
          );
        }
      } catch (e) {
        console.error("Failed to save chapters to Drive:", e);
      } finally {
        setIsSyncing(false);
      }
    },
    [volumeId, storageKey]
  );

  const updateChaptersLocally = (newChapters: Chapter[]) => {
    setChapters(newChapters);
    
    // Update localStorage immediately (as cache)
    const saved = localStorage.getItem(storageKey);
    let lastSynced = null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        lastSynced = Array.isArray(parsed) ? null : parsed.lastSynced;
      } catch (e) {}
    }

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        chapters: newChapters,
        lastSynced, // keep current sync time until server confirms
      })
    );

    // Debounce save to Drive
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveToDrive(newChapters);
    }, 2000);
  };

  const addChapter = (title: string, startPage: number) => {
    const newChapter: Chapter = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      startPage,
    };
    const updated = [...chapters, newChapter].sort((a, b) => a.startPage - b.startPage);
    updateChaptersLocally(updated);
  };

  const removeChapter = (id: string) => {
    const updated = chapters.filter((c) => c.id !== id);
    updateChaptersLocally(updated);
  };

  const editChapter = (id: string, title: string, startPage: number) => {
    const updated = chapters.map((c) =>
      c.id === id ? { ...c, title, startPage } : c
    ).sort((a, b) => a.startPage - b.startPage);
    updateChaptersLocally(updated);
  };

  return {
    chapters,
    addChapter,
    removeChapter,
    editChapter,
    isLoaded,
    isSyncing,
  };
}

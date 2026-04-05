"use client";

import { useState, useMemo } from "react";
import { Annotation } from "@/lib/books";
import { useChapters } from "@/hooks/use-chapters";
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Pencil,
  Check,
  BookText,
  X,
  Filter,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Search
} from "lucide-react";

interface AnnotationsListProps {
  annotations: Annotation[];
  volumeId: string;
}

export const parseHighlightStyle = (style?: string) => {
  if (!style) return { type: 'DEFAULT', color: 'DEFAULT', displayName: 'Default' };
  
  let colorValue = '';
  if (style.startsWith('{')) {
    try {
      const parsed = JSON.parse(style);
      colorValue = parsed['background-color']?.toUpperCase() || '';
    } catch (e) {
      console.error("Failed to parse highlightStyle JSON:", style);
    }
  } else {
    colorValue = style.toUpperCase();
  }

  // Map to English names based on Hex or Name
  if (colorValue.includes('#FFB5BB') || colorValue.includes('#FFB4BB') || colorValue === 'PINK') {
    return { type: 'NAME', color: 'PINK', displayName: 'Red' };
  }
  if (colorValue.includes('#9AE7E2') || colorValue === 'BLUE') {
    return { type: 'NAME', color: 'BLUE', displayName: 'Blue' };
  }
  if (colorValue.includes('#BAFF99') || colorValue === 'GREEN') {
    return { type: 'NAME', color: 'GREEN', displayName: 'Green' };
  }
  if (colorValue.includes('#FFE68A') || colorValue === 'YELLOW') {
    return { type: 'NAME', color: 'YELLOW', displayName: 'Yellow' };
  }

  if (!colorValue) return { type: 'DEFAULT', color: 'DEFAULT', displayName: 'Default' };
  
  return { type: 'NAME', color: 'ETC', displayName: 'Etc' };
};

export const getHighlightStyles = (colorName?: string) => {
  switch (colorName) {
    case "YELLOW":
      return { 
        container: "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10", 
        quote: "border-yellow-200 dark:border-yellow-800" 
      };
    case "BLUE":
      return { 
        container: "border-blue-400 bg-blue-50 dark:bg-blue-900/10", 
        quote: "border-blue-200 dark:border-blue-800" 
      };
    case "PINK": // Mapping to Red UI
      return { 
        container: "border-red-400 bg-red-50 dark:bg-red-900/10", 
        quote: "border-red-200 dark:border-red-800" 
      };
    case "GREEN":
      return { 
        container: "border-green-400 bg-green-50 dark:bg-green-900/10", 
        quote: "border-green-200 dark:border-green-800" 
      };
    case "ETC":
      return { 
        container: "border-purple-400 bg-purple-50 dark:bg-purple-900/10", 
        quote: "border-purple-200 dark:border-purple-800" 
      };
    default:
      return { 
        container: "border-gray-300 bg-white dark:bg-gray-800", 
        quote: "border-gray-200 dark:border-gray-600" 
      };
  }
};

interface GroupedAnnotations {
  title: string;
  annotations: Annotation[];
  startPage?: number;
  id: string;
}

export function AnnotationsList({ annotations, volumeId }: AnnotationsListProps) {
  const { chapters, addChapter, removeChapter, editChapter, isLoaded, isSyncing } = useChapters(volumeId);
  const [selectedColor, setSelectedColor] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isManagingChapters, setIsManagingChapters] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterPage, setNewChapterPage] = useState("");
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterPage, setEditChapterPage] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const colorCategories = useMemo(() => {
    const order = ["All", "Yellow", "Red", "Green", "Blue", "Etc"];
    const categories: Record<string, { count: number, displayName: string, internalColor: string }> = { 
      ALL: { count: annotations.length, displayName: 'All', internalColor: 'DEFAULT' } 
    };
    
    annotations.forEach((a) => {
      const { color, displayName } = parseHighlightStyle(a.highlightStyle);
      const key = color || "DEFAULT";
      if (!categories[key]) {
        categories[key] = { count: 0, displayName: displayName || key, internalColor: key };
      }
      categories[key].count++;
    });

    return Object.entries(categories).sort(([keyA, infoA], [keyB, infoB]) => {
      const indexA = order.indexOf(infoA.displayName);
      const indexB = order.indexOf(infoB.displayName);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    }).reduce((acc, [key, val]) => {
      acc[key] = val;
      return acc;
    }, {} as Record<string, { count: number, displayName: string, internalColor: string }>);
  }, [annotations]);

  const filteredAnnotations = useMemo(() => {
    return annotations.filter((a) => {
      const matchesColor = selectedColor === "ALL" || parseHighlightStyle(a.highlightStyle).color === selectedColor;
      const matchesSearch = !searchQuery || 
        (a.note?.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (a.textSnippet?.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesColor && matchesSearch;
    });
  }, [annotations, selectedColor, searchQuery]);

  const groupedAnnotations = useMemo(() => {
    const groups: GroupedAnnotations[] = [];
    
    // Sort chapters by startPage
    const sortedChapters = [...chapters].sort((a, b) => a.startPage - b.startPage);

    // Initial groups
    const uncategorizedGroup: GroupedAnnotations = { id: "uncategorized", title: "Uncategorized (No Page)", annotations: [] };
    const introGroup: GroupedAnnotations = { id: "intro", title: "Intro", annotations: [] };
    
    const chapterGroups: GroupedAnnotations[] = sortedChapters.map(c => ({
      id: c.id,
      title: c.title,
      startPage: c.startPage,
      annotations: []
    }));

    filteredAnnotations.forEach(a => {
      if (!a.pageNumber) {
        uncategorizedGroup.annotations.push(a);
        return;
      }

      const pageNum = parseInt(a.pageNumber);
      
      // Check if it's in the Intro (before first chapter)
      if (sortedChapters.length > 0 && pageNum < sortedChapters[0].startPage) {
        introGroup.annotations.push(a);
        return;
      }
      
      // Find the appropriate chapter
      let targetGroup = introGroup; // Fallback to intro if no chapters exist
      for (let i = sortedChapters.length - 1; i >= 0; i--) {
        if (pageNum >= sortedChapters[i].startPage) {
          targetGroup = chapterGroups[i];
          break;
        }
      }
      targetGroup.annotations.push(a);
    });

    if (uncategorizedGroup.annotations.length > 0) groups.push(uncategorizedGroup);
    if (introGroup.annotations.length > 0) groups.push(introGroup);

    const activeChapters = searchQuery 
      ? chapterGroups.filter(c => c.annotations.length > 0) 
      : chapterGroups;

    return groups.concat(activeChapters);
  }, [filteredAnnotations, chapters, isManagingChapters, searchQuery]);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChapterTitle && newChapterPage) {
      addChapter(newChapterTitle, parseInt(newChapterPage));
      setNewChapterTitle("");
      setNewChapterPage("");
    }
  };

  return (
    <div className="pb-20 relative">
      {/* Title Section (Non-sticky) */}
      <div className="flex items-center justify-between md:justify-start md:gap-4 pt-2 pb-0 md:py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <MessageSquare className="text-blue-500" />
            <span className="whitespace-nowrap">Memos</span>
          </h2>
          {isSyncing && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              SYNCING
            </div>
          )}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium md:mt-1">
          Total: {annotations.length}
        </span>
      </div>

      {/* Sticky Buttons (Transparent Background) */}
      <div className="sticky top-0 z-20 flex justify-end pointer-events-none md:-mt-14 mb-2">
        <div className="flex items-center gap-2 pointer-events-auto py-2">
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none w-20 md:w-32"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              id="color-filter"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer pr-2"
            >
              {Object.entries(colorCategories).map(([key, info]) => (
                <option key={key} value={key} className="bg-white dark:bg-gray-800">
                  {info.displayName} ({info.count})
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={() => setIsManagingChapters(!isManagingChapters)}
            className={`p-2 rounded-xl border transition-colors shadow-sm ${isManagingChapters ? "bg-blue-100 border-blue-300 text-blue-600" : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-500 hover:text-blue-500 border-gray-200 dark:border-gray-700"}`}
            title="Manage Chapters"
          >
            <BookText className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {/* Chapter Management Form */}
      {isManagingChapters && (
        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <ListIcon className="w-4 h-4" />
              Manage Book Chapters
            </h3>
            <button onClick={() => setIsManagingChapters(false)} className="text-blue-400 hover:text-blue-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddChapter} className="flex flex-wrap gap-3 mb-6">
            <input 
              type="text" 
              placeholder="Chapter Title" 
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              className="flex-grow min-w-[200px] px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input 
              type="number" 
              placeholder="Start Page" 
              value={newChapterPage}
              onChange={(e) => setNewChapterPage(e.target.value)}
              className="w-24 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              Add
            </button>
          </form>

          {chapters.length > 0 && (
            <div className="space-y-1">

              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Existing Chapters</p>
              {chapters.map((chapter) => (
                <div key={chapter.id} className="flex items-center justify-between bg-white/50 dark:bg-black/20 p-3 rounded-xl text-sm border border-blue-100/50 dark:border-blue-900/20">
                  {editingChapterId === chapter.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input 
                        type="number"
                        value={editChapterPage}
                        onChange={(e) => setEditChapterPage(e.target.value)}
                        className="w-16 px-2 py-1 rounded bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 text-xs"
                        autoFocus
                      />
                      <input 
                        type="text"
                        value={editChapterTitle}
                        onChange={(e) => setEditChapterTitle(e.target.value)}
                        className="flex-1 px-2 py-1 rounded bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            editChapter(chapter.id, editChapterTitle, parseInt(editChapterPage));
                            setEditingChapterId(null);
                          } else if (e.key === 'Escape') {
                            setEditingChapterId(null);
                          }
                        }}
                      />
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => {
                            editChapter(chapter.id, editChapterTitle, parseInt(editChapterPage));
                            setEditingChapterId(null);
                          }}
                          className="text-green-500 hover:text-green-600 p-1"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setEditingChapterId(null)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-12 shrink-0">
                          <span className="font-bold text-blue-700 dark:text-blue-400 w-12">
                            p.{chapter.startPage}
                          </span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-200">{chapter.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => {
                            setEditingChapterId(chapter.id);
                            setEditChapterTitle(chapter.title);
                            setEditChapterPage(chapter.startPage.toString());
                          }}
                          className="text-blue-400 hover:text-blue-600 p-1"
                          title="Edit chapter"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => removeChapter(chapter.id)} 
                          className="text-red-400 hover:text-red-600 p-1"
                          title="Delete chapter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grouped Annotations List */}
      <div className="space-y-1">
        {filteredAnnotations.length === 0 && (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-xl text-center border border-gray-200 dark:border-gray-700 my-8">
            <p className="text-gray-500 dark:text-gray-400">
              No matching memos found.
            </p>
          </div>
        )}

        {groupedAnnotations.map((group) => {
          const isExpanded = !!expandedGroups[group.id];
          
          return (
            <div key={group.id} className="space-y-4">
                <button 
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between group py-3 border-b border-gray-500 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-700 transition-colors"
                >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded transition-colors ${!isExpanded ? 'text-gray-400' : 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'}`}>
                    {!isExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                  <h3 className={`font-bold transition-colors text-left ${group.annotations.length ? "text-gray-800 dark:text-gray-100" : "text-gray-400"}`}>
                    {group.title}
                    {group.startPage && <span className="ml-2 text-sm font-normal text-gray-400">(p.{group.startPage})</span>}
                  </h3>
                </div>
                <span className="text-xs font-bold text-gray-300 dark:text-gray-600 group-hover:text-blue-300 transition-colors shrink-0 text-right">
                  ( {group.annotations.length} )
                </span>
              </button>

              {isExpanded && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  {group.annotations.map((annotation) => {
                    const { color } = parseHighlightStyle(annotation.highlightStyle);
                    const styles = getHighlightStyles(color);
                    const readerUrl = `https://play.google.com/books/reader?id=${volumeId}` +
                      `&gb_annotation=${annotation.id}` +
                      `${annotation.pageId ? `&pg=${annotation.pageId}` : ''}`;
                    
                    return (
                      <div key={annotation.id} className="group">
                        <a
                          href={readerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View in Google Play Books"
                          className={`relative block px-4 py-2 rounded-xl shadow-sm border transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${styles.container}`}
                        >
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          </div>
                          {annotation.textSnippet && (
                            <div className={annotation.note ? "mb-2" : "mb-0"}>
                              <blockquote 
                                className={`text-gray-700 dark:text-gray-200 pl-1 py-0.5 pr-6 ${styles.quote}`}
                              >
                                {annotation.textSnippet}
                              </blockquote>
                            </div>
                          )}

                          {annotation.note && (
                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Your Memo
                              </p>
                              <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap bg-white/50 dark:bg-black/20 p-2 rounded-lg text-sm">
                                {annotation.note}
                              </p>
                            </div>
                          )}
                        </a>

                        <div className="mt-1 mb-0.5 px-1 text-[10px] text-gray-400 flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                          {annotation.pageNumber && (
                            <span>p. {annotation.pageNumber}</span>
                          )}
                          <span>
                            {new Date(annotation.updated).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                      </div>
                    );

                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );
}

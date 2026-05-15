# Agent Instructions

Before working in this repository, use the Node.js 20.11.0 binary installed by nvm:

```sh
export PATH="/Users/im-yujin/.nvm/versions/node/v20.11.0/bin:$PATH"
node -v
```

The `node -v` output should be `v20.11.0`. Use this Node version for installing dependencies, running scripts, tests, builds, and dev servers. Do not rely on `nvm use` inside Codex sessions, because `nvm` may not be loaded in the shell.

## Project Context

This project is `google-books-memo-viewer`, a Next.js 14 App Router application for viewing a signed-in user's Google Play Books / Google Books library, highlights, and personal notes. It uses Google OAuth through NextAuth, reads purchased books and annotations from the Google Books API, and syncs per-book chapter metadata, page offsets, and book notes to Google Drive JSON files.

Main user flow:

- `/`: login/logout entry point and library navigation.
- `/dashboard`: server-rendered purchased book grid.
- `/dashboard/book/[id]`: book detail view with annotations, search, color filters, chapter grouping, page offset controls, and book notes.
- `/api/auth/[...nextauth]`: NextAuth Google OAuth route.
- `/api/chapters/[id]`: reads and writes per-book chapter/offset/notes data via Google Drive.

Important structure:

- `src/app`: Next.js routes, layout, global CSS, dashboard pages, privacy page, and API routes.
- `src/components`: reusable UI, especially `annotations-list.tsx` for the main memo/highlight interaction, plus providers, footer, and session-expired UI.
- `src/hooks/use-chapters.ts`: localStorage cache and debounced Google Drive sync for chapter/offset/notes state.
- `src/lib/auth.ts`: Google OAuth scopes, NextAuth callbacks, and access-token refresh.
- `src/lib/books.ts`: Google Books API calls for purchased books and annotations.
- `src/lib/google-drive.ts`: Google Drive folder/file lookup, creation, updates, and JSON reads.

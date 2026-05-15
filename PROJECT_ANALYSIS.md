# Google Books Memo Viewer 프로젝트 분석

## 프로젝트 개요

이 프로젝트는 Google 계정으로 로그인한 사용자의 Google Play Books/Google Books 데이터를 가져와서, 구매한 책 목록과 책별 하이라이트/메모를 웹에서 보기 좋게 보여주는 Next.js 애플리케이션입니다.

핵심 기능은 다음과 같습니다.

- Google OAuth 로그인
- Google Books API를 통한 구매 책장 조회
- 책별 annotations, 즉 하이라이트와 사용자 메모 조회
- 메모 색상별 필터링 및 텍스트 검색
- 메모를 페이지/챕터 단위로 묶어 보기
- 책별 챕터 정보, 페이지 보정값, 책 전체 노트를 Google Drive JSON 파일로 동기화

프로젝트 이름은 `google-books-memo-viewer`이며, Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, NextAuth를 사용합니다.

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 14.2.3 |
| UI | React 18, Tailwind CSS |
| 언어 | TypeScript |
| 인증 | NextAuth.js, Google OAuth |
| 외부 API | Google Books API, Google Drive API, Open Library API |
| 아이콘 | lucide-react |
| 패키지 매니저 | npm |

## 실행 스크립트

`package.json` 기준으로 다음 스크립트가 정의되어 있습니다.

```bash
npm run dev
npm run build
npm run start
npm run lint
```

개발 서버는 기본적으로 `next dev`를 사용합니다.

## 환경 변수

`.env.example`에는 다음 값이 필요하다고 명시되어 있습니다.

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_any_random_string
```

Google OAuth scope는 [src/lib/auth.ts](/Users/im-yujin/Documents/programming/etc/google-books/src/lib/auth.ts)에 정의되어 있으며, 다음 권한을 요청합니다.

- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/books`
- `https://www.googleapis.com/auth/drive.file`

`access_type=offline`, `prompt=consent` 설정이 있어 refresh token을 받아 액세스 토큰을 갱신하는 구조입니다.

## 주요 사용자 흐름

1. 사용자가 홈 화면(`/`)에서 Google 계정으로 로그인합니다.
2. 로그인 성공 후 `/dashboard`로 이동합니다.
3. 서버에서 NextAuth 세션을 확인하고 Google access token을 꺼냅니다.
4. Google Books API의 `mylibrary/bookshelves/7/volumes`를 호출해 구매한 책 목록을 가져옵니다.
5. 사용자가 책을 선택하면 `/dashboard/book/[id]`로 이동합니다.
6. 해당 책의 annotations를 Google Books API에서 가져옵니다.
7. 사용자는 메모를 검색하거나 색상별로 필터링하고, 챕터/페이지 기준으로 그룹화해서 볼 수 있습니다.
8. 책별 챕터, 페이지 offset, 책 노트는 localStorage에 먼저 저장되고, Google Drive에도 JSON 파일로 동기화됩니다.

## 파일 구조

```text
.
├── package.json
├── package-lock.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── next-env.d.ts
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── auth
│   │   │   │   └── [...nextauth]
│   │   │   │       └── route.ts
│   │   │   └── chapters
│   │   │       └── [id]
│   │   │           └── route.ts
│   │   ├── dashboard
│   │   │   ├── book
│   │   │   │   └── [id]
│   │   │   │       └── page.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── annotations-list.tsx
│   │   └── providers.tsx
│   ├── hooks
│   │   └── use-chapters.ts
│   └── lib
│       ├── auth.ts
│       ├── books.ts
│       └── google-drive.ts
└── PROJECT_ANALYSIS.md
```

## 디렉터리별 역할

### `src/app`

Next.js App Router 라우트가 들어 있는 영역입니다.

- [src/app/page.tsx](/Users/im-yujin/Documents/programming/etc/google-books/src/app/page.tsx): 홈 화면입니다. 로그인 상태에 따라 Google 로그인 버튼 또는 라이브러리 이동 버튼을 보여줍니다.
- [src/app/layout.tsx](/Users/im-yujin/Documents/programming/etc/google-books/src/app/layout.tsx): 전역 레이아웃입니다. Inter 폰트와 `SessionProvider`를 적용합니다.
- [src/app/globals.css](/Users/im-yujin/Documents/programming/etc/google-books/src/app/globals.css): Tailwind 지시문과 기본 전역 스타일이 있습니다.
- [src/app/dashboard/page.tsx](/Users/im-yujin/Documents/programming/etc/google-books/src/app/dashboard/page.tsx): 로그인한 사용자의 구매 책 목록을 그리드로 보여줍니다.
- [src/app/dashboard/book/[id]/page.tsx](/Users/im-yujin/Documents/programming/etc/google-books/src/app/dashboard/book/[id]/page.tsx): 특정 책의 상세 정보와 메모 목록을 보여줍니다.

### `src/app/api`

서버 API route가 들어 있습니다.

- [src/app/api/auth/[...nextauth]/route.ts](/Users/im-yujin/Documents/programming/etc/google-books/src/app/api/auth/[...nextauth]/route.ts): NextAuth 핸들러입니다.
- [src/app/api/chapters/[id]/route.ts](/Users/im-yujin/Documents/programming/etc/google-books/src/app/api/chapters/[id]/route.ts): 책별 챕터/offset/노트 데이터를 Google Drive와 읽고 쓰는 API입니다.

### `src/lib`

외부 API 연동과 인증 설정을 담당합니다.

- [src/lib/auth.ts](/Users/im-yujin/Documents/programming/etc/google-books/src/lib/auth.ts): Google OAuth provider, JWT/session callback, access token refresh 로직이 있습니다.
- [src/lib/books.ts](/Users/im-yujin/Documents/programming/etc/google-books/src/lib/books.ts): Google Books API와 Open Library API 호출 로직이 있습니다.
- [src/lib/google-drive.ts](/Users/im-yujin/Documents/programming/etc/google-books/src/lib/google-drive.ts): Google Drive 폴더/파일 조회, 생성, 수정, JSON 콘텐츠 읽기를 담당합니다.

### `src/components`

화면에서 재사용되는 클라이언트 컴포넌트가 있습니다.

- [src/components/providers.tsx](/Users/im-yujin/Documents/programming/etc/google-books/src/components/providers.tsx): NextAuth `SessionProvider` 래퍼입니다.
- [src/components/annotations-list.tsx](/Users/im-yujin/Documents/programming/etc/google-books/src/components/annotations-list.tsx): 메모 목록 UI의 핵심 컴포넌트입니다. 색상 필터, 검색, 챕터 관리, 책 노트, 페이지 offset, 그룹 접기/펼치기, Google Play Books 원문 링크를 처리합니다.

### `src/hooks`

클라이언트 상태와 동기화 로직이 있습니다.

- [src/hooks/use-chapters.ts](/Users/im-yujin/Documents/programming/etc/google-books/src/hooks/use-chapters.ts): 책별 챕터/offset/노트를 localStorage에 캐싱하고, `/api/chapters/[id]`를 통해 Google Drive와 동기화합니다.

## 데이터 흐름

### 인증 데이터

NextAuth가 Google OAuth 로그인을 처리합니다.

- 최초 로그인 시 `account.access_token`, `account.expires_at`, `account.refresh_token`을 JWT token에 저장합니다.
- access token 만료 전에는 기존 token을 유지합니다.
- 만료되면 Google OAuth token endpoint를 호출해 access token을 갱신합니다.
- session callback에서 `session.accessToken`을 노출해 서버 페이지와 API route에서 사용합니다.

### 책 목록 데이터

[src/lib/books.ts](/Users/im-yujin/Documents/programming/etc/google-books/src/lib/books.ts)의 `fetchReadBooks`가 다음 endpoint를 호출합니다.

```text
https://www.googleapis.com/books/v1/mylibrary/bookshelves/7/volumes
```

bookshelf id `7`은 코드상 "Purchased" 책장으로 취급됩니다. 응답에서 다음 정보를 `Book` 형태로 정리합니다.

- `id`
- `title`
- `authors`
- `thumbnail`
- `publishedDate`
- `acquiredDate`
- `description`
- `isbn`

### 메모 데이터

`fetchAnnotations`는 다음 endpoint를 호출합니다.

```text
https://www.googleapis.com/books/v1/mylibrary/annotations
```

책 상세 페이지에서는 `volumeId` query를 붙여 특정 책의 메모만 가져옵니다. 가져온 데이터는 다음 처리를 거칩니다.

- 삭제된 annotation 제외
- 하이라이트 텍스트와 사용자 노트 추출
- JSON 문자열 형태의 노트에서 `note` 필드 추출
- 페이지 번호 추출
- 북마크처럼 실제 텍스트/노트가 없는 항목 제외
- 페이지 번호와 위치 기준 정렬

### 챕터/노트 데이터

책별 사용자 관리 데이터는 다음 형태로 저장됩니다.

```json
{
  "chapters": [],
  "offset": 0,
  "notes": ""
}
```

저장 위치는 두 곳입니다.

- 브라우저 `localStorage`: 빠른 로컬 캐시
- Google Drive: `my-book-notes` 폴더 아래 `{volumeId}.json`

`useChapters` 훅은 최초 로딩 시 localStorage를 먼저 읽고, 이후 Google Drive에서 최신 데이터를 가져옵니다. 변경 사항은 즉시 localStorage에 반영되고, 2초 debounce 후 Drive에 저장됩니다.

## 라우트 요약

| 경로 | 유형 | 역할 |
| --- | --- | --- |
| `/` | Page | 로그인/로그아웃 및 라이브러리 진입 |
| `/dashboard` | Server Page | 구매 책 목록 표시 |
| `/dashboard/book/[id]` | Server Page | 책 상세 및 메모 목록 표시 |
| `/api/auth/[...nextauth]` | API Route | NextAuth 인증 처리 |
| `/api/chapters/[id]` | API Route | 책별 챕터/offset/노트 Drive 동기화 |

## UI 기능

메모 상세 화면의 [src/components/annotations-list.tsx](/Users/im-yujin/Documents/programming/etc/google-books/src/components/annotations-list.tsx)가 대부분의 인터랙션을 담당합니다.

- 검색어 기반 메모 필터
- 하이라이트 색상 기반 필터
- 하이라이트 색상별 카드 스타일
- 챕터 시작 페이지 등록/수정/삭제
- 페이지 번호 offset 조정
- 책 전체 노트 작성
- 챕터별 메모 그룹화
- 그룹 접기/펼치기
- Google Play Books reader로 annotation 링크 열기

## 외부 서비스 연동

### Google Books API

구매 책 목록과 annotations를 가져옵니다.

### Google Drive API

앱 자체 데이터, 즉 챕터/offset/책 노트를 사용자의 Drive에 저장합니다. `drive.file` scope를 사용하므로 앱이 생성하거나 접근 권한을 가진 파일 중심으로 동작하는 구조입니다.

### Open Library API

[src/lib/books.ts](/Users/im-yujin/Documents/programming/etc/google-books/src/lib/books.ts)의 `fetchTableOfContents`에서 ISBN 기반 목차 조회 기능이 구현되어 있습니다. 현재 읽은 범위에서는 UI에서 직접 호출되는 곳은 보이지 않습니다.

## 설정 파일

- [next.config.mjs](/Users/im-yujin/Documents/programming/etc/google-books/next.config.mjs): `books.google.com` 이미지를 Next Image remote pattern으로 허용합니다.
- [tailwind.config.ts](/Users/im-yujin/Documents/programming/etc/google-books/tailwind.config.ts): App Router와 components 경로를 Tailwind content 대상으로 지정합니다.
- [tsconfig.json](/Users/im-yujin/Documents/programming/etc/google-books/tsconfig.json): TypeScript 설정입니다.
- [postcss.config.mjs](/Users/im-yujin/Documents/programming/etc/google-books/postcss.config.mjs): Tailwind/PostCSS 설정입니다.

## 현재 코드에서 눈에 띄는 점

- [src/lib/books.ts](/Users/im-yujin/Documents/programming/etc/google-books/src/lib/books.ts)는 현재 git 기준 수정된 상태입니다.
- `fetchTableOfContents`는 구현되어 있지만, 현재 UI 흐름에서는 사용처가 보이지 않습니다.
- `fetchReadBooks` 안에 `console.log(data.items?.[0]);`가 있어 실제 사용자 책 데이터 일부가 서버 로그에 찍힐 수 있습니다.
- 메모/책 API 요청은 `cache: 'no-store'`를 사용해 최신 데이터를 우선합니다.
- 챕터 저장은 localStorage와 Drive를 같이 쓰기 때문에 UX는 빠르지만, 여러 기기에서 동시에 수정하면 마지막 저장이 덮어쓸 가능성이 있습니다.
- API route의 POST body validation은 약한 편입니다. 현재는 `{ chapters, offset, notes }` 형태라고 가정하고 Drive에 저장합니다.

## 한 줄 요약

Google Books Memo Viewer는 Google Books에서 구매한 책과 책별 하이라이트/메모를 가져와 읽기 쉽게 정리하고, 사용자가 직접 챕터/페이지 보정/책 노트를 관리할 수 있게 Google Drive 동기화까지 붙인 개인 독서 메모 뷰어입니다.

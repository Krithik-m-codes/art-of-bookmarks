# Art of Bookmarks

This is a small bookmark app I built with Next.js + Supabase.

It has:

- Google OAuth only (no email/password)
- private bookmarks per user
- realtime updates across tabs
- create, read, update, delete
- favorites

## Stack

- Next.js (App Router)
- Supabase (Auth + Postgres + Realtime)
- Tailwind CSS
- Vercel

## Run locally

1. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

1. Install and run:

```bash
bun install
bun run dev
```

1. Open `http://localhost:3000`

For DB + auth setup, check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

## DB notes

The `bookmarks` table should include at least:

- `id`
- `user_id`
- `title`
- `url`
- `description`
- `is_favorite` (boolean, default false)
- `created_at`
- `updated_at`

RLS is enabled, and policies only allow a user to access their own rows.

## Issues I hit in deployment (and fixes)

### 1) Next.js metadata viewport warning

Problem:

- Vercel build showed: unsupported `metadata.viewport` in `/_not-found` and `/auth`

Fix:

- moved viewport settings out of `metadata` and into `export const viewport`
- removed manual theme-color meta from `<head>` and used viewport config

### 2) `useSearchParams` suspense error on `/auth`

Problem:

- build failed with `useSearchParams() should be wrapped in a suspense boundary`

Fix:

- split `/auth` into:
  - server `page.tsx` that renders `<Suspense>`
  - client `AuthPageClient.tsx` that uses `useSearchParams`

### 3) OAuth redirect issues

Problem:

- Google login worked locally but failed on deployed URL

Fix:

- added both redirect URLs correctly:
  - Supabase callback URL (`https://<project>.supabase.co/auth/v1/callback`)
  - app callback / return URL (`https://<your-domain>/bookmarks`)
- made sure Google provider is enabled and Email provider is disabled

### 4) Realtime showing wrong user data (early bug)

Problem:

- realtime payload handling was too loose initially

Fix:

- user-specific channel and filter
- extra guard in code: ignore payloads where `user_id !== currentUser.id`
- write operations include `.eq("user_id", user.id)`

## What I’d improve next

- tags/categories
- bulk import
- better form validation + toast feedback

## Useful docs in this repo

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

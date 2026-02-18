# Art of Bookmarks

A smart bookmark manager with real-time sync across devices, powered by Next.js and Supabase.

## 🚀 Quick Links

**New here?** Start with [GETTING_STARTED.md](./GETTING_STARTED.md) for a complete guide.

- 📖 [Getting Started](./GETTING_STARTED.md) - Setup walkthrough
- ⚡ [Quick Start](./QUICKSTART.md) - 15-minute setup
- 📚 [Supabase Setup](./SUPABASE_SETUP.md) - Database configuration
- 🚀 [Deployment](./DEPLOYMENT.md) - Deploy on Vercel
- 🔧 [Troubleshooting](./TROUBLESHOOTING.md) - Common issues & fixes

## Features

✅ **Google OAuth Authentication (Only)** - Secure sign in/sign up with Google only (email/password disabled)
✅ **Private Bookmarks** - Each user sees only their own bookmarks
✅ **Real-time Updates** - Changes sync instantly across all open tabs using Supabase Realtime
✅ **Full CRUD Operations** - Create, read, update, and delete bookmarks
✅ **Favorites** - Star bookmarks and filter to favorites instantly
✅ **Responsive Design** - Works on desktop and mobile with Tailwind CSS
✅ **Row-Level Security** - Built-in database security to prevent unauthorized access

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Real-time**: Supabase Realtime (PostgreSQL subscriptions)
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel

### Why This Stack?

- **Next.js App Router**: Server and client components, API routes, and seamless Vercel integration
- **Supabase**: One platform for auth, database, and realtime without managing separate services
- **Tailwind CSS**: Rapid UI development with utility classes
- **Vercel**: Automatic deployments from GitHub with edge functions support

## Quick Start

### Prerequisites

- Node.js 18+
- Bun or npm/yarn
- Supabase account (free tier available)
- Google OAuth credentials

### 1. Setup Supabase

Follow the [Supabase Setup Guide](./SUPABASE_SETUP.md) to:

- Create a Supabase project
- Set up the database schema
- Configure Google OAuth

### 2. Environment Variables

Create `.env.local` in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 3. Install & Run

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Open http://localhost:3000
```

## How to Use

1. **Sign In**: Click "Sign in with Google" on the login page
2. **Add Bookmark**: Enter URL, title, and optional description
3. **Edit Bookmark**: Update title, URL, and description inline
4. **Favorites**: Star important bookmarks and filter by favorites
5. **Real-time Sync**: Open the app in multiple tabs and watch updates instantly
6. **Delete**: Remove bookmarks anytime

## Project Structure

```text
.
├── app/
│   ├── auth/              # Authentication pages
│   │   ├── page.tsx       # Login page with Supabase Auth UI
│   │   └── callback/route.ts # OAuth callback handler
│   ├── bookmarks/         # Main bookmark management page
│   │   └── page.tsx       # Bookmarks list and form
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Redirect to auth/bookmarks
│   └── globals.css        # Tailwind styles
├── components/
│   ├── BookmarkForm.tsx   # Form to add bookmarks
│   └── BookmarkList.tsx   # List of bookmarks with delete
├── lib/
│   └── supabase.ts        # Supabase client setup
├── public/                # Static files
├── package.json
├── tsconfig.json
├── next.config.ts
└── SUPABASE_SETUP.md      # Detailed Supabase setup guide
```

## Key Implementation Details

### Authentication Flow

1. User navigates to `/auth`
2. Auth page exposes Google OAuth only
3. User redirects to Google, then back to `/auth/callback`
4. Session is established and user redirects to `/bookmarks`

### Database Schema

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP,
  UNIQUE(user_id, url)
)
```

### Real-time Updates

- Uses Supabase Realtime subscription on `postgres_changes` event
- Subscribes to `INSERT`, `UPDATE`, `DELETE` events for user's bookmarks
- Automatically updates React state when changes occur

### Security

- Row-Level Security (RLS) policies ensure users can only see/modify their own bookmarks
- Database enforces `auth.uid() = user_id` check
- No backend server needed - Supabase handles all authentication

## Problems Encountered & Solutions

### 1. **Realtime Channel Naming**

**Problem**: Channel name wasn't user-specific, causing real-time updates from all users to appear.

**Solution**: Changed channel name to `bookmarks:${user_id}` and added filter on RLS policy:

```typescript
channel: `bookmarks:${session.user.id}`,
filter: `user_id=eq.${session.user.id}`
```

### 2. **UNIQUE Constraint Conflicts**

**Problem**: Users couldn't bookmark the same URL twice.

**Solution**: Made the UNIQUE constraint composite:

```sql
UNIQUE(user_id, url)
```

This allows different users to bookmark the same URL.

### 3. **Session Persistence**

**Problem**: Users logged out after page refresh.

**Solution**: Supabase.js handles this automatically by storing session in localStorage. We just check for existing session in the useEffect:

```typescript
const { data: { session } } = await supabase.auth.getSession()
```

### 4. **RLS Policy Permissions**

**Problem**: Bookmarks weren't visible even after correct configuration.

**Solution**: Applied RLS policies to the auth.users table and ensured all operations (SELECT, INSERT, DELETE, UPDATE) had matching policies.

### 5. **Real-time Subscription Cleanup**

**Problem**: Memory leaks from unused subscriptions when unmounting components.

**Solution**: Added cleanup in useEffect return:

```typescript
return () => {
  if (subscriptionRef.current) {
    subscriptionRef.current.unsubscribe()
  }
}
```

### 6. **Type Safety**

**Problem**: TypeScript errors from Supabase returned data.

**Solution**: Created Bookmark interface and cast data:

```typescript
interface Bookmark {
  id: string
  url: string
  title: string
  // ... other fields
}
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/art-of-bookmarks.git
git push -u origin main
```

1. **Deploy on Vercel**

- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Add environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Click Deploy

1. **Update Google OAuth**

- In Supabase → Authentication → Providers → Google
- Add redirect URI: `https://YOUR_VERCEL_URL/auth/callback`

1. **Done!**
Your app is now live at `https://YOUR_VERCEL_URL`

## Performance Optimization

- ✅ Server-side session checks prevent unnecessary client renders
- ✅ Real-time subscriptions only for current user's bookmarks
- ✅ Indexed queries on user_id for fast lookups
- ✅ Tailwind CSS with purge for minimal CSS bundle
- ✅ Image optimization with next/image

## Future Enhancements

- [ ] Bookmark tagging/categories
- [ ] Search and filter functionality
- [ ] Bulk import from browser
- [ ] Export bookmarks as JSON/HTML
- [ ] Sharing public collections
- [ ] Dark mode toggle
- [ ] Reading list feature

## Security Considerations

- ✅ All secrets stored in `.env.local` (never in git)
- ✅ RLS policies enforce user isolation at database level
- ✅ No sensitive data in browser localStorage except session token
- ✅ Vercel automatic HTTPS for all deployments
- ✅ Supabase provides DDoS protection and backups

## License

MIT

## Support

For issues or questions:

1. Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for setup help
2. Review browser console for error messages
3. Check Supabase dashboard logs for database errors

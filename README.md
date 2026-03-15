# MTHR Magazine — App

Documentary honest imagery. A photographer community platform for family photography.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Database + Auth**: Supabase
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

---

## Getting started

### 1. Clone and install

```bash
cd mthr-app
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your project dashboard, go to **Settings → API** and copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep this secret)
3. Copy the env file and fill in your keys:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run the database schema

In your Supabase dashboard, go to **SQL Editor** and paste + run the contents of:

```
supabase-schema.sql
```

This creates all tables, RLS policies, triggers, and seeds the initial places and magazine issue.

### 4. Create storage buckets

In your Supabase dashboard, go to **Storage** and create three buckets:

| Bucket name  | Public | Max file size |
|-------------|--------|---------------|
| submissions | No     | 50 MB         |
| avatars     | Yes    | 5 MB          |
| magazine    | Yes    | 100 MB        |

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/explore`.

---

## Pages

| Route | Description |
|-------|-------------|
| `/explore` | Main feed — hero, photo grid, featured photographers |
| `/places` | World locations grid with session counts |
| `/magazine` | Numbered issue index |
| `/submit` | Submission form with image upload (requires auth) |
| `/login` | Sign in |
| `/signup` | Create account |
| `/photographer/[username]` | Photographer profile + work grid |
| `/submission/[id]` | Individual submission view |

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## Customisation

### Brand colors
Edit `tailwind.config.ts` → `colors.mthr`

### Typography
Fonts are loaded via `next/font/google` in `src/app/layout.tsx`.
Currently: **Bebas Neue** (structural) + **Cormorant Garamond** (editorial) + **DM Sans** (UI)

### Database
Full TypeScript types are in `src/types/database.ts` — update these whenever you change the schema.

---

## Folder structure

```
src/
  app/
    explore/page.tsx          Main feed
    places/page.tsx           Locations grid
    magazine/page.tsx         Issue index
    submit/page.tsx           Upload form
    login/page.tsx            Auth — sign in
    signup/page.tsx           Auth — create account
    photographer/
      [username]/page.tsx     Photographer profile
    submission/
      [id]/page.tsx           Submission detail
  components/
    layout/
      TopNav.tsx              Sticky nav with auth state
      Footer.tsx              Site footer
  lib/
    supabase/
      client.ts               Browser Supabase client
      server.ts               Server Supabase client
      middleware.ts           Session refresh + route protection
  types/
    database.ts               Full TypeScript types
  middleware.ts               Next.js middleware
```

---

## Next steps

- [ ] Admin dashboard to approve/reject submissions
- [ ] Photographer profile editing
- [ ] Mapbox integration for the Places map view
- [ ] Magazine digital reader
- [ ] Email notifications (Resend)
- [ ] Submission status emails to photographers

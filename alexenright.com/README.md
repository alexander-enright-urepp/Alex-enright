# AlexEnright.com

A production-ready mobile-first web app built with Next.js, Supabase, and Tailwind CSS.

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** everywhere
- **Supabase** (Postgres, Auth, Storage, RLS)
- **Tailwind CSS** for styling
- **Resend** for transactional email
- **Zod** for validation

## Project Structure

```
alexenright.com/
├── src/
│   ├── app/
│   │   ├── actions/         # Server Actions
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── page.tsx         # Main app with tabs
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── admin/           # Admin components
│   │   ├── games/           # Mini games
│   │   ├── icons/           # SVG icons
│   │   ├── navigation/      # Bottom nav
│   │   ├── tabs/            # Main tab views
│   │   └── ui/              # Reusable UI components
│   ├── lib/
│   │   ├── supabase/        # Supabase clients & types
│   │   ├── resend.ts        # Email service
│   │   ├── utils.ts         # Utilities
│   │   └── validation.ts    # Zod schemas
│   └── types/
│       └── index.ts         # TypeScript types
├── sql/
│   └── schema.sql           # Database schema & RLS
└── public/
    └── manifest.json        # PWA manifest
```

## Setup Instructions

### 1. Clone & Install

```bash
cd alexenright.com
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor → New query
3. Copy contents from `sql/schema.sql` and run it
4. Go to Storage → New bucket → Create bucket named `resumes` (make it private)

### 3. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=alex@alexenright.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Setup Admin User

1. Go to Supabase → Authentication → Users
2. Create a new user with email/password
3. Go to SQL Editor and run:
   ```sql
   INSERT INTO admin_users (email) VALUES ('your-email@example.com');
   ```

### 5. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

## Admin Dashboard

Navigate to `/admin/login` to access the admin dashboard.

## Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Capacitor (iOS/Android)

```bash
# Build the app first
npm run build

# Install Capacitor (when ready)
npm install @capacitor/core @capacitor/cli
npx cap init AlexEnright com.alexenright.app --web-dir dist

# Add platforms
npx cap add ios
npx cap add android

# Sync and open
npx cap sync
npx cap open ios
```

## Features

- **Recruiter Tab**: Form with resume upload, email notifications
- **Play Tab**: Mini games (Coin Flip, Dice, RPS, Tic Tac Toe, Snake)
- **Daily Tab**: Blog posts with likes
- **Community Tab**: Job board and posts
- **About Tab**: Profile with hire options
- **Admin Dashboard**: Manage submissions, posts, jobs

## Database Schema

See `sql/schema.sql` for full schema with RLS policies.

## License

MIT
// Deployment trigger Mon Apr 27 12:13:43 PDT 2026

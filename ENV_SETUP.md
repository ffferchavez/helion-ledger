# Environment Setup Guide

## Quick Start Options

### Option 1: Mock Data Mode (Fastest - No Database Setup)

Perfect for UI preview and development without database setup.

1. Create `.env.local`:
```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

2. Run:
```bash
npm run dev:mock
```

That's it! You'll see the UI with sample data.

### Option 2: Full Setup with Database

1. Set up Supabase project
2. Configure `.env.local` with all variables
3. Run migrations: `npm run db:push`
4. Apply RLS policies from `db/rls/policies.sql`
5. Seed data: `npm run db:seed`
6. Run: `npm run dev`

## Environment Variables Reference

### Required for Production

```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://...
```

### Optional

```env
# Use mock data instead of database
NEXT_PUBLIC_USE_MOCK_DATA=true

# For seeding script
MOCK_AUTH_USER_ID=your-auth-user-id

# App URL (defaults to http://localhost:3000)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Switching Between Dev and Prod

### Development Mode
```bash
npm run dev          # Uses .env.local, connects to dev database
npm run dev:mock     # Uses mock data, no database needed
```

### Production Mode
```bash
npm run build:prod   # Builds with NODE_ENV=production
npm run start:prod   # Starts with NODE_ENV=production
```

The app automatically detects the environment and adjusts behavior accordingly.


# Helion Ledger

A production-grade financial backoffice web application for managing invoices, expenses, clients, and tax reporting for businesses operating in Germany and Mexico.

## Features

- **Invoice Management**: Create, edit, and manage invoices with multi-currency support (EUR, MXN, USD)
- **Expense Tracking**: Record and categorize business expenses with receipt uploads
- **Client Management**: Maintain a database of clients/counterparties
- **Tax Reporting**: Generate financial summaries and tax reports by period and country
- **Multi-language Support**: Invoice templates in English, German, and Spanish
- **PDF Generation**: Generate professional invoice PDFs
- **Multi-tenant Architecture**: Built with organization-level data isolation using Supabase RLS

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Postgres, Auth, Storage, RLS)
- **ORM**: Drizzle ORM
- **PDF Generation**: PDFKit
- **Form Handling**: React Hook Form + Zod

## Prerequisites

- Node.js 18+ and npm
- A Supabase project (create one at [supabase.com](https://supabase.com))

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Environment
NODE_ENV=development  # or "production"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database (for Drizzle migrations)
DATABASE_URL=postgresql://user:password@host:port/database

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Mock Data (for UI preview without database)
NEXT_PUBLIC_USE_MOCK_DATA=false  # Set to "true" to use mock data
MOCK_AUTH_USER_ID=your-auth-user-id  # For seeding script
```

**Quick Start with Mock Data:**

To see the UI immediately without setting up the database:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Then run: `npm run dev:mock`

### 3. Database Setup

#### Run Drizzle Migrations

```bash
npm run db:generate  # Generate migration files
npm run db:push      # Push schema to database
```

Or use migrations:

```bash
npm run db:migrate   # Run migrations
```

#### Apply RLS Policies

After running migrations, apply the Row Level Security policies:

1. Open your Supabase SQL Editor
2. Copy the contents of `db/rls/policies.sql`
3. Execute the SQL in the Supabase SQL Editor

### 4. Create Initial Organization and User

After setting up authentication, you'll need to:

1. Create an organization record in the `organizations` table
2. Create a user record in the `users` table linking to your Supabase auth user

Example SQL (run in Supabase SQL Editor):

```sql
-- Create organization (replace with your details)
INSERT INTO organizations (name, country_base, default_currency)
VALUES ('Helion City', 'DE', 'EUR')
RETURNING id;

-- Create user (replace auth_user_id with your Supabase auth user ID)
INSERT INTO users (auth_user_id, organization_id, role, email)
VALUES (
  'your-auth-user-id-here',
  'organization-id-from-above',
  'owner',
  'your-email@example.com'
);
```

### 5. Seed Mock Data (Optional)

To populate the database with sample data:

```bash
npm run db:seed
```

Make sure to set `MOCK_AUTH_USER_ID` in your `.env.local` with your Supabase auth user ID.

### 6. Run Development Server

**With real database:**
```bash
npm run dev
```

**With mock data (no database needed):**
```bash
npm run dev:mock
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Production Build

**Development build:**
```bash
npm run build
npm start
```

**Production build:**
```bash
npm run build:prod
npm run start:prod
```

## Project Structure

```
helion-ledger/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── invoices/          # Invoice management
│   ├── expenses/          # Expense management
│   ├── reports/           # Financial reports
│   └── settings/          # Organization settings
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── invoices/         # Invoice-specific components
│   ├── expenses/         # Expense-specific components
│   └── layout/           # Layout components
├── db/                   # Database layer
│   ├── schema/           # Drizzle schema definitions
│   ├── queries/          # Database query functions
│   └── rls/              # RLS policy SQL
├── lib/                  # Utilities and domain logic
│   ├── supabase/         # Supabase client utilities
│   ├── pdf/              # PDF generation
│   ├── validation/       # Zod schemas
│   └── constants.ts      # Constants and enums
└── types/                # TypeScript type definitions
```

## Available Scripts

### Development
- `npm run dev` - Start development server (with real database)
- `npm run dev:mock` - Start development server with mock data (no database needed)

### Production
- `npm run build` - Build for production
- `npm run build:prod` - Build with production environment
- `npm run start` - Start production server
- `npm run start:prod` - Start with production environment

### Database
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:seed` - Seed database with mock data

### Other
- `npm run lint` - Run ESLint

## Key Features Implementation

### Invoice Number Generation

Invoice numbers are auto-generated in the format: `INV-{COUNTRY}-{YEAR}-{NUMBER}`

Example: `INV-DE-2024-0001`

### PDF Generation

PDFs are generated server-side using PDFKit. Access via:
- API route: `/api/pdf/invoice?invoiceId={id}`
- Download button on invoice detail page

### Multi-currency Support

The application supports EUR, MXN, and USD. Currency formatting is handled automatically based on the selected currency.

### Tax Calculations

Tax is calculated per line item and aggregated. Supports different tax rates per item.

## Security

- All database queries are protected by Row Level Security (RLS)
- User authentication via Supabase Auth
- Organization-level data isolation
- Server-side validation with Zod schemas

## Development Notes

- The application uses TypeScript strict mode
- Server components are used where possible for better performance
- Client components are used for interactive forms and UI
- All database operations go through typed query functions in `db/queries/`

## License

Private - Internal use for Helion City

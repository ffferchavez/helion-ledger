<!-- a962beda-c1e1-4e9e-8e1c-81ebd63760b1 bdfb1a41-d5ae-4e6b-8077-475c2fecd67e -->
# Helion Ledger - Architecture & Implementation Plan

## Project Structure

```
helion-ledger/
├── .env.local                    # Environment variables (not committed)
├── .env.example                  # Example env vars template
├── .gitignore
├── package.json
├── tsconfig.json                 # TypeScript strict config
├── next.config.js
├── tailwind.config.ts
├── components.json               # shadcn/ui config
├── drizzle.config.ts             # Drizzle config
│
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Dashboard (/)
│   ├── (auth)/
│   │   ├── login/
│   │   └── callback/             # Supabase auth callback
│   ├── invoices/
│   │   ├── page.tsx              # Invoice list
│   │   ├── new/
│   │   │   └── page.tsx          # Create invoice
│   │   └── [id]/
│   │       ├── page.tsx          # View/edit invoice
│   │       └── actions.ts        # Server actions
│   ├── expenses/
│   │   ├── page.tsx              # Expense list
│   │   ├── new/
│   │   │   └── page.tsx          # Create expense
│   │   └── [id]/
│   │       ├── page.tsx          # View/edit expense
│   │       └── actions.ts        # Server actions
│   ├── reports/
│   │   ├── page.tsx              # Reports dashboard
│   │   └── actions.ts            # Export actions
│   ├── settings/
│   │   ├── page.tsx              # Organization settings
│   │   └── actions.ts            # Settings actions
│   └── api/                      # API routes (if needed)
│       └── pdf/
│           └── route.ts          # PDF generation endpoint
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── invoices/
│   │   ├── invoice-form.tsx
│   │   ├── invoice-list.tsx
│   │   └── invoice-preview.tsx
│   ├── expenses/
│   │   ├── expense-form.tsx
│   │   └── expense-list.tsx
│   ├── reports/
│   │   └── report-summary.tsx
│   └── layout/
│       ├── header.tsx
│       └── sidebar.tsx
│
├── db/                           # Database layer
│   ├── schema/
│   │   ├── index.ts              # Export all schemas
│   │   ├── organizations.ts
│   │   ├── users.ts
│   │   ├── clients.ts
│   │   ├── invoices.ts
│   │   ├── invoice-items.ts
│   │   ├── expenses.ts
│   │   └── tax-summaries.ts
│   ├── migrations/               # Drizzle migrations
│   ├── queries/                  # Reusable query functions
│   │   ├── invoices.ts
│   │   ├── expenses.ts
│   │   ├── clients.ts
│   │   └── reports.ts
│   ├── rls/                      # RLS policy SQL files
│   │   └── policies.sql
│   └── index.ts                  # Drizzle client export
│
├── lib/                          # Domain logic & utilities
│   ├── supabase/
│   │   ├── client.ts             # Client-side Supabase client
│   │   ├── server.ts             # Server-side Supabase client
│   │   └── middleware.ts         # Auth middleware
│   ├── pdf/
│   │   ├── invoice-generator.ts  # PDF generation logic
│   │   └── templates/            # PDF templates
│   ├── currency.ts               # Currency formatting utilities
│   ├── date.ts                   # Date utilities
│   ├── validation/               # Zod schemas
│   │   ├── invoices.ts
│   │   ├── expenses.ts
│   │   └── clients.ts
│   └── constants.ts              # Enums, constants
│
├── supabase/
│   ├── functions/                # Edge Functions
│   │   └── generate-invoice-pdf/
│   │       ├── index.ts
│   │       └── package.json
│   ├── migrations/               # Supabase SQL migrations (if needed)
│   └── config.toml
│
└── types/                        # Shared TypeScript types
    ├── database.ts               # Generated Drizzle types
    └── index.ts
```

## Drizzle Schema Design

### Core Tables

**organizations**

- `id` (uuid, primary key)
- `name` (text)
- `country_base` (enum: 'DE' | 'MX')
- `default_currency` (enum: 'EUR' | 'MXN')
- `tax_id_de` (text, nullable) - VAT ID for Germany
- `tax_id_mx` (text, nullable) - RFC for Mexico
- `address_line_1`, `address_line_2`, `city`, `postal_code`, `country` (text, nullable)
- `created_at`, `updated_at` (timestamps)

**users**

- `id` (uuid, primary key)
- `auth_user_id` (uuid, unique, references Supabase auth.users)
- `organization_id` (uuid, FK to organizations)
- `role` (enum: 'owner' | 'user')
- `email` (text)
- `created_at`, `updated_at` (timestamps)

**clients**

- `id` (uuid, primary key)
- `organization_id` (uuid, FK)
- `name` (text)
- `contact_person` (text, nullable)
- `email` (text, nullable)
- `phone` (text, nullable)
- `address_line_1`, `address_line_2`, `city`, `postal_code`, `country` (text, nullable)
- `default_currency` (enum, nullable)
- `default_language` (enum: 'en' | 'de' | 'es', default 'en')
- `tax_id` (text, nullable) - VAT ID or RFC
- `created_at`, `updated_at` (timestamps)

**invoices**

- `id` (uuid, primary key)
- `organization_id` (uuid, FK)
- `client_id` (uuid, FK to clients)
- `invoice_number` (text, unique per org/year/country)
- `issue_date` (date)
- `due_date` (date)
- `currency` (enum: 'EUR' | 'MXN' | 'USD')
- `language` (enum: 'en' | 'de' | 'es')
- `status` (enum: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled')
- `subtotal_amount` (numeric)
- `tax_amount` (numeric)
- `total_amount` (numeric)
- `notes` (text, nullable)
- `pdf_url` (text, nullable) - Supabase Storage URL
- `country_context` (enum: 'DE' | 'MX' | 'OTHER')
- `created_at`, `updated_at` (timestamps)

**invoice_items**

- `id` (uuid, primary key)
- `invoice_id` (uuid, FK to invoices, cascade delete)
- `description` (text)
- `quantity` (numeric)
- `unit_price` (numeric)
- `tax_rate` (numeric) - percentage (e.g., 19.0 for 19%)
- `line_subtotal` (numeric) - quantity * unit_price
- `line_tax` (numeric) - calculated tax
- `line_total` (numeric) - subtotal + tax
- `sort_order` (integer) - for ordering items

**expenses**

- `id` (uuid, primary key)
- `organization_id` (uuid, FK)
- `vendor_name` (text)
- `description` (text, nullable)
- `amount` (numeric)
- `currency` (enum: 'EUR' | 'MXN' | 'USD')
- `tax_rate` (numeric) - percentage
- `tax_amount` (numeric)
- `total_amount` (numeric)
- `category` (enum: 'rent' | 'software' | 'travel' | 'office' | 'professional_services' | 'utilities' | 'marketing' | 'other')
- `country_context` (enum: 'DE' | 'MX' | 'OTHER')
- `deductible` (boolean, default true)
- `date` (date)
- `payment_method` (enum: 'card' | 'cash' | 'transfer' | 'other')
- `receipt_url` (text, nullable) - Supabase Storage URL
- `created_at`, `updated_at` (timestamps)

**tax_period_summaries** (cached aggregates)

- `id` (uuid, primary key)
- `organization_id` (uuid, FK)
- `period_start` (date)
- `period_end` (date)
- `period_type` (enum: 'monthly' | 'quarterly' | 'yearly')
- `country_context` (enum: 'DE' | 'MX' | 'OTHER')
- `total_revenue` (numeric)
- `total_expenses` (numeric)
- `total_tax_collected` (numeric)
- `total_tax_paid` (numeric)
- `created_at`, `updated_at` (timestamps)

### Indexes

- `invoices.organization_id`, `invoices.invoice_number`
- `expenses.organization_id`, `expenses.date`
- `clients.organization_id`
- `users.organization_id`, `users.auth_user_id`

## Implementation Steps

### Phase 1: Project Setup & Database

1. Initialize Next.js 15 project with TypeScript strict mode
2. Install dependencies: Supabase client, Drizzle ORM, shadcn/ui, react-hook-form, zod, pdfkit
3. Configure Tailwind CSS and shadcn/ui
4. Set up Drizzle config and connection to Supabase Postgres
5. Create Drizzle schema files for all tables
6. Generate initial migration
7. Create RLS policy SQL file (to be applied manually in Supabase)
8. Set up environment variable template (.env.example)

### Phase 2: Core Infrastructure

9. Create Supabase client utilities (server/client)
10. Create auth middleware/helpers
11. Set up database query functions (queries/)
12. Create TypeScript enums and constants (lib/constants.ts)
13. Create currency and date utilities
14. Set up Zod validation schemas for forms

### Phase 3: Authentication & Multi-tenancy

15. Implement login page with Supabase Auth
16. Create auth callback handler
17. Set up user/organization context helpers
18. Create protected route middleware

### Phase 4: Clients Management

19. Create clients list page
20. Create client form component with validation
21. Implement client CRUD server actions
22. Add client selection component for invoices

### Phase 5: Invoice Management

23. Create invoices list page with filters
24. Create invoice form component (with line items)
25. Implement invoice CRUD server actions
26. Add invoice number generation logic (per org/year/country)
27. Create invoice preview component
28. Implement PDF generation (Edge Function + storage)
29. Add PDF download functionality

### Phase 6: Expense Management

30. Create expenses list page with filters
31. Create expense form component
32. Implement expense CRUD server actions
33. Add file upload for receipts (Supabase Storage)
34. Implement receipt display/download

### Phase 7: Reports & Tax Summary

35. Create reports page with period/country filters
36. Implement report query functions (aggregate data)
37. Add CSV export functionality
38. Create PDF summary generator
39. Add tax period summary caching (optional optimization)

### Phase 8: Settings & Polish

40. Create settings page for organization
41. Add organization update server actions
42. Implement dashboard with summary cards
43. Add loading states and error handling
44. Add toast notifications (shadcn/ui)
45. Polish UI/UX and responsive design

### Phase 9: Testing & Documentation

46. Test all flows end-to-end
47. Document environment setup
48. Add README with setup instructions
49. Document RLS policies application process

### To-dos

- [x] Initialize Next.js 15 project with TypeScript, install dependencies (Supabase, Drizzle, shadcn/ui, react-hook-form, zod, pdfkit), configure Tailwind and shadcn/ui
- [x] Create Drizzle schema files for all tables (organizations, users, clients, invoices, invoice_items, expenses, tax_period_summaries), generate initial migration, create RLS policy SQL file
- [x] Create Supabase client utilities (server/client), auth helpers, database query functions, TypeScript enums/constants, currency/date utilities, Zod validation schemas
- [x] Implement login page with Supabase Auth, auth callback handler, user/organization context helpers, protected route middleware
- [x] Create clients list page, client form component with validation, client CRUD server actions, client selection component
- [x] Create invoices list page with filters, invoice form with line items, invoice CRUD server actions, invoice number generation, PDF generation (Edge Function), PDF download
- [x] Create expenses list page with filters, expense form component, expense CRUD server actions, file upload for receipts (Supabase Storage)
- [x] Create reports page with filters, implement report query functions, add CSV export, create PDF summary generator
- [x] Create settings page for organization, implement dashboard with summary cards, add loading states/error handling, polish UI/UX
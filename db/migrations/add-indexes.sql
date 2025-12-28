-- Indexes for Helion Ledger
-- Run this SQL in your Supabase SQL Editor after running Drizzle migrations

CREATE INDEX IF NOT EXISTS users_organization_id_idx ON users(organization_id);
CREATE INDEX IF NOT EXISTS users_auth_user_id_idx ON users(auth_user_id);

CREATE INDEX IF NOT EXISTS clients_organization_id_idx ON clients(organization_id);

CREATE INDEX IF NOT EXISTS invoices_organization_id_idx ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS invoices_invoice_number_idx ON invoices(invoice_number);

CREATE INDEX IF NOT EXISTS expenses_organization_id_idx ON expenses(organization_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);


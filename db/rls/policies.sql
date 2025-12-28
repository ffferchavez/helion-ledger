-- Row Level Security (RLS) Policies for Helion Ledger
-- Apply these policies in your Supabase SQL Editor after running migrations

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_period_summaries ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organization_id
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS uuid AS $$
  SELECT organization_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id = get_user_organization_id());

CREATE POLICY "Users can update their own organization"
  ON organizations FOR UPDATE
  USING (id = get_user_organization_id());

-- Users policies
CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can update users in their organization"
  ON users FOR UPDATE
  USING (organization_id = get_user_organization_id());

-- Clients policies
CREATE POLICY "Users can view clients in their organization"
  ON clients FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert clients in their organization"
  ON clients FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update clients in their organization"
  ON clients FOR UPDATE
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete clients in their organization"
  ON clients FOR DELETE
  USING (organization_id = get_user_organization_id());

-- Invoices policies
CREATE POLICY "Users can view invoices in their organization"
  ON invoices FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert invoices in their organization"
  ON invoices FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update invoices in their organization"
  ON invoices FOR UPDATE
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete invoices in their organization"
  ON invoices FOR DELETE
  USING (organization_id = get_user_organization_id());

-- Invoice items policies (inherited through invoice_id)
CREATE POLICY "Users can view invoice items in their organization"
  ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Users can insert invoice items in their organization"
  ON invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Users can update invoice items in their organization"
  ON invoice_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Users can delete invoice items in their organization"
  ON invoice_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.organization_id = get_user_organization_id()
    )
  );

-- Expenses policies
CREATE POLICY "Users can view expenses in their organization"
  ON expenses FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert expenses in their organization"
  ON expenses FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update expenses in their organization"
  ON expenses FOR UPDATE
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete expenses in their organization"
  ON expenses FOR DELETE
  USING (organization_id = get_user_organization_id());

-- Tax period summaries policies
CREATE POLICY "Users can view tax summaries in their organization"
  ON tax_period_summaries FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert tax summaries in their organization"
  ON tax_period_summaries FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update tax summaries in their organization"
  ON tax_period_summaries FOR UPDATE
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete tax summaries in their organization"
  ON tax_period_summaries FOR DELETE
  USING (organization_id = get_user_organization_id());


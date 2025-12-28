import { db } from "../index";
import { invoices, invoiceItems } from "../schema";
import { eq, and, gte, lte, ilike, or, desc } from "drizzle-orm";
import type { NewInvoice, Invoice } from "../schema/invoices";
import type { NewInvoiceItem } from "../schema/invoice-items";

/**
 * Get all invoices for an organization with optional filters
 */
export async function getInvoicesByOrganization(
  organizationId: string,
  filters?: {
    status?: string;
    countryContext?: string;
    startDate?: Date;
    endDate?: Date;
    clientId?: string;
  }
) {
  const conditions = [eq(invoices.organizationId, organizationId)];

  if (filters?.status) {
    conditions.push(eq(invoices.status, filters.status as any));
  }

  if (filters?.countryContext) {
    conditions.push(eq(invoices.countryContext, filters.countryContext as any));
  }

  if (filters?.startDate) {
    conditions.push(gte(invoices.issueDate, filters.startDate.toISOString()));
  }

  if (filters?.endDate) {
    conditions.push(lte(invoices.issueDate, filters.endDate.toISOString()));
  }

  if (filters?.clientId) {
    conditions.push(eq(invoices.clientId, filters.clientId));
  }

  return db
    .select()
    .from(invoices)
    .where(and(...conditions))
    .orderBy(desc(invoices.issueDate));
}

/**
 * Get an invoice by ID with items
 */
export async function getInvoiceById(invoiceId: string, organizationId: string) {
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.organizationId, organizationId)))
    .limit(1);

  if (!invoice) {
    return null;
  }

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoiceId))
    .orderBy(invoiceItems.sortOrder);

  return { ...invoice, items };
}

/**
 * Create a new invoice with items
 */
export async function createInvoice(
  invoiceData: NewInvoice,
  itemsData: NewInvoiceItem[]
) {
  const [invoice] = await db.insert(invoices).values(invoiceData).returning();

  if (itemsData.length > 0) {
    const itemsWithInvoiceId = itemsData.map((item, index) => ({
      ...item,
      invoiceId: invoice.id,
      sortOrder: index,
    }));

    await db.insert(invoiceItems).values(itemsWithInvoiceId);
  }

  return invoice;
}

/**
 * Update an invoice
 */
export async function updateInvoice(
  invoiceId: string,
  organizationId: string,
  data: Partial<Omit<Invoice, "id" | "organizationId" | "createdAt">>
) {
  const [invoice] = await db
    .update(invoices)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(invoices.id, invoiceId), eq(invoices.organizationId, organizationId)))
    .returning();

  return invoice || null;
}

/**
 * Update invoice items (replace all items)
 */
export async function updateInvoiceItems(
  invoiceId: string,
  itemsData: NewInvoiceItem[]
) {
  // Delete existing items
  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));

  // Insert new items
  if (itemsData.length > 0) {
    const itemsWithInvoiceId = itemsData.map((item, index) => ({
      ...item,
      invoiceId,
      sortOrder: index,
    }));

    await db.insert(invoiceItems).values(itemsWithInvoiceId);
  }
}

/**
 * Delete an invoice (cascade deletes items)
 */
export async function deleteInvoice(invoiceId: string, organizationId: string) {
  await db
    .delete(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.organizationId, organizationId)));
}

/**
 * Get the next invoice number for an organization/year/country
 */
export async function getNextInvoiceNumber(
  organizationId: string,
  year: number,
  countryContext: string
): Promise<string> {
  const prefix = `INV-${countryContext}-${year}-`;
  
  // In mock mode, return a simple number
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || !process.env.DATABASE_URL) {
    return `${prefix}0001`;
  }

  // Find the highest invoice number for this org/year/country
  const existingInvoices = await db
    .select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(
      and(
        eq(invoices.organizationId, organizationId),
        eq(invoices.countryContext, countryContext as any)
      )
    );

  let maxNum = 0;

  for (const inv of existingInvoices) {
    if (inv.invoiceNumber.startsWith(prefix)) {
      const numStr = inv.invoiceNumber.replace(prefix, "");
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  return `${prefix}${nextNum.toString().padStart(4, "0")}`;
}


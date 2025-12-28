"use server";

import { requireOrganizationId } from "@/lib/supabase/auth-helpers";
import { revalidatePath } from "next/cache";
import {
  createInvoice,
  getInvoiceById,
  updateInvoice,
  updateInvoiceItems,
  deleteInvoice,
  getNextInvoiceNumber,
} from "@/db/queries/invoices";
import { invoiceSchema, type InvoiceFormData } from "@/lib/validation/invoices";
import { calculateTax, calculateTotal } from "@/lib/currency";
import { getCurrentYear } from "@/lib/date";
import { env } from "@/lib/env";
import { addMockInvoice } from "@/lib/mock-store";
import { randomUUID } from "crypto";

export async function createInvoiceAction(data: InvoiceFormData) {
  try {
    const organizationId = await requireOrganizationId();
    const validated = invoiceSchema.parse(data);

    // Calculate totals
    let subtotal = 0;
    const items = validated.items.map((item) => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const lineTax = calculateTax(lineSubtotal, item.taxRate);
      const lineTotal = calculateTotal(lineSubtotal, lineTax);
      subtotal += lineSubtotal;

      return {
        description: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        taxRate: item.taxRate.toString(),
        lineSubtotal: lineSubtotal.toString(),
        lineTax: lineTax.toString(),
        lineTotal: lineTotal.toString(),
      };
    });

    const totalTax = items.reduce((sum, item) => sum + parseFloat(item.lineTax), 0);
    const totalAmount = calculateTotal(subtotal, totalTax);

    // Generate invoice number
    const year = getCurrentYear();
    const invoiceNumber = await getNextInvoiceNumber(
      organizationId,
      year,
      validated.countryContext
    );

    const itemsWithSort = items.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));

    if (env.USE_MOCK_DATA || !env.DATABASE_URL) {
      const now = new Date();
      const invoiceId = randomUUID();
      const mockInvoice = addMockInvoice({
        id: invoiceId,
        organizationId,
        clientId: validated.clientId,
        invoiceNumber,
        issueDate: validated.issueDate,
        dueDate: validated.dueDate,
        currency: validated.currency,
        language: validated.language,
        countryContext: validated.countryContext,
        status: "draft",
        subtotalAmount: subtotal.toString(),
        taxAmount: totalTax.toString(),
        totalAmount: totalAmount.toString(),
        notes: validated.notes || null,
        pdfUrl: null,
        createdAt: now,
        updatedAt: now,
        items: itemsWithSort.map((item) => ({
          id: randomUUID(),
          invoiceId,
          ...item,
        })) as any,
      });

      revalidatePath("/invoices");
      return { success: true, data: mockInvoice };
    }

    const newInvoice = await createInvoice(
      {
        organizationId,
        clientId: validated.clientId,
        invoiceNumber,
        issueDate: validated.issueDate,
        dueDate: validated.dueDate,
        currency: validated.currency,
        language: validated.language,
        countryContext: validated.countryContext,
        status: "draft",
        subtotalAmount: subtotal.toString(),
        taxAmount: totalTax.toString(),
        totalAmount: totalAmount.toString(),
        notes: validated.notes || null,
      },
      itemsWithSort as any
    );

    revalidatePath("/invoices");
    return { success: true, data: newInvoice };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create invoice",
    };
  }
}

export async function updateInvoiceAction(invoiceId: string, data: InvoiceFormData) {
  try {
    const organizationId = await requireOrganizationId();
    const validated = invoiceSchema.parse(data);

    // Calculate totals
    let subtotal = 0;
    const items = validated.items.map((item) => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const lineTax = calculateTax(lineSubtotal, item.taxRate);
      const lineTotal = calculateTotal(lineSubtotal, lineTax);
      subtotal += lineSubtotal;

      return {
        description: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        taxRate: item.taxRate.toString(),
        lineSubtotal: lineSubtotal.toString(),
        lineTax: lineTax.toString(),
        lineTotal: lineTotal.toString(),
      };
    });

    const totalTax = items.reduce((sum, item) => sum + parseFloat(item.lineTax), 0);
    const totalAmount = calculateTotal(subtotal, totalTax);

    const updated = await updateInvoice(invoiceId, organizationId, {
      clientId: validated.clientId,
      issueDate: validated.issueDate,
      dueDate: validated.dueDate,
      currency: validated.currency,
      language: validated.language,
      countryContext: validated.countryContext,
      subtotalAmount: subtotal.toString(),
      taxAmount: totalTax.toString(),
      totalAmount: totalAmount.toString(),
      notes: validated.notes || null,
    });

    if (!updated) {
      return { success: false, error: "Invoice not found" };
    }

    // Update items
    await updateInvoiceItems(
      invoiceId,
      items.map((item, index) => ({
        ...item,
        sortOrder: index,
      })) as any
    );

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating invoice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update invoice",
    };
  }
}

export async function deleteInvoiceAction(invoiceId: string) {
  try {
    const organizationId = await requireOrganizationId();
    await deleteInvoice(invoiceId, organizationId);
    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete invoice",
    };
  }
}

export async function updateInvoiceStatusAction(invoiceId: string, status: string) {
  try {
    const organizationId = await requireOrganizationId();
    const updated = await updateInvoice(invoiceId, organizationId, {
      status: status as any,
    });

    if (!updated) {
      return { success: false, error: "Invoice not found" };
    }

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating invoice status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update invoice status",
    };
  }
}

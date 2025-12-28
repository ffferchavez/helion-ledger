/**
 * Helper functions to use mock data in development
 */

import { env } from "./env";
import type { Invoice } from "@/db/schema/invoices";
import type { Expense } from "@/db/schema/expenses";
import type { Client } from "@/db/schema/clients";
import { mockInvoices, mockExpenses, mockClients } from "./mock-data";
import { getCurrentYear, getCurrentMonth, getPeriodDates } from "./date";
import { COUNTRY_CONTEXT } from "./constants";

/**
 * Get mock invoices (for UI preview when database is not available)
 */
export function getMockInvoices(): Array<Invoice & { items: any[] }> {
  return mockInvoices.map((inv, idx) => ({
    id: `mock-invoice-${idx}`,
    organizationId: "mock-org-id",
    clientId: mockClients[idx % mockClients.length].name || "mock-client-id",
    invoiceNumber: `INV-${inv.countryContext}-2024-${String(idx + 1).padStart(4, "0")}`,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    currency: inv.currency,
    language: inv.language,
    status: inv.status,
    subtotalAmount: inv.subtotalAmount,
    taxAmount: inv.taxAmount,
    totalAmount: inv.totalAmount,
    notes: inv.notes || null,
    pdfUrl: null,
    countryContext: inv.countryContext,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: `mock-item-${idx}-0`,
        invoiceId: `mock-invoice-${idx}`,
        description: "Web Development Services",
        quantity: "40.00",
        unitPrice: "150.00",
        taxRate: "19.00",
        lineSubtotal: "6000.00",
        lineTax: "1140.00",
        lineTotal: "7140.00",
        sortOrder: 0,
      },
    ],
  })) as any;
}

/**
 * Get mock expenses
 */
export function getMockExpenses(): Expense[] {
  return mockExpenses.map((exp, idx) => ({
    id: `mock-expense-${idx}`,
    organizationId: "mock-org-id",
    vendorName: exp.vendorName,
    description: exp.description || null,
    amount: exp.amount,
    currency: exp.currency,
    taxRate: exp.taxRate,
    taxAmount: exp.taxAmount,
    totalAmount: exp.totalAmount,
    category: exp.category,
    countryContext: exp.countryContext,
    deductible: exp.deductible,
    date: exp.date,
    paymentMethod: exp.paymentMethod,
    receiptUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })) as any;
}

/**
 * Get mock clients
 */
export function getMockClients(): Client[] {
  return mockClients.map((client, idx) => ({
    id: `mock-client-${idx}`,
    organizationId: "mock-org-id",
    name: client.name,
    contactPerson: client.contactPerson || null,
    email: client.email || null,
    phone: client.phone || null,
    addressLine1: client.addressLine1 || null,
    addressLine2: client.addressLine2 || null,
    city: client.city || null,
    postalCode: client.postalCode || null,
    country: client.country || null,
    defaultCurrency: client.defaultCurrency || null,
    defaultLanguage: client.defaultLanguage || "en",
    taxId: client.taxId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })) as any;
}

/**
 * Get mock financial summary
 */
export function getMockFinancialSummary() {
  const deInvoices = mockInvoices.filter((inv) => inv.countryContext === COUNTRY_CONTEXT.DE);
  const mxInvoices = mockInvoices.filter((inv) => inv.countryContext === COUNTRY_CONTEXT.MX);
  const deExpenses = mockExpenses.filter((exp) => exp.countryContext === COUNTRY_CONTEXT.DE);
  const mxExpenses = mockExpenses.filter((exp) => exp.countryContext === COUNTRY_CONTEXT.MX);

  const deRevenue = deInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0);
  const deTaxCollected = deInvoices.reduce((sum, inv) => sum + parseFloat(inv.taxAmount), 0);
  const deExpenseTotal = deExpenses.reduce((sum, exp) => sum + parseFloat(exp.totalAmount), 0);
  const deTaxPaid = deExpenses.reduce((sum, exp) => sum + parseFloat(exp.taxAmount), 0);

  const mxRevenue = mxInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0);
  const mxTaxCollected = mxInvoices.reduce((sum, inv) => sum + parseFloat(inv.taxAmount), 0);
  const mxExpenseTotal = mxExpenses.reduce((sum, exp) => sum + parseFloat(exp.totalAmount), 0);
  const mxTaxPaid = mxExpenses.reduce((sum, exp) => sum + parseFloat(exp.taxAmount), 0);

  const allRevenue = deRevenue + mxRevenue;
  const allTaxCollected = deTaxCollected + mxTaxCollected;
  const allExpenses = deExpenseTotal + mxExpenseTotal;
  const allTaxPaid = deTaxPaid + mxTaxPaid;

  return {
    revenue: {
      total: allRevenue,
      taxCollected: allTaxCollected,
      count: mockInvoices.length,
    },
    expenses: {
      total: allExpenses,
      taxPaid: allTaxPaid,
      deductible: mockExpenses
        .filter((e) => e.deductible)
        .reduce((sum, exp) => sum + parseFloat(exp.totalAmount), 0),
      count: mockExpenses.length,
    },
    net: {
      result: allRevenue - allExpenses,
      taxNet: allTaxCollected - allTaxPaid,
    },
  };
}


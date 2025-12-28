import type { Invoice } from "@/db/schema/invoices";
import type { InvoiceItem } from "@/db/schema/invoice-items";
import type { Expense } from "@/db/schema/expenses";

export type MockInvoice = Invoice & { items: InvoiceItem[] };

const invoiceStore: MockInvoice[] = [];
const expenseStore: Expense[] = [];

export function addMockInvoice(invoice: MockInvoice) {
  invoiceStore.unshift(invoice);
  return invoice;
}

export function addMockExpense(expense: Expense) {
  expenseStore.unshift(expense);
  return expense;
}

export function getMockInvoiceStore() {
  return invoiceStore;
}

export function getMockExpenseStore() {
  return expenseStore;
}

import { pgTable, uuid, text, numeric, integer } from "drizzle-orm/pg-core";
import { invoices } from "./invoices";

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 19, scale: 4 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 19, scale: 4 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull(), // percentage, e.g., 19.00
  lineSubtotal: numeric("line_subtotal", { precision: 19, scale: 4 }).notNull(),
  lineTax: numeric("line_tax", { precision: 19, scale: 4 }).notNull(),
  lineTotal: numeric("line_total", { precision: 19, scale: 4 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;


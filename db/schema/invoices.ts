import { pgTable, uuid, text, timestamp, date, numeric, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { clients } from "./clients";
import { currencyEnum } from "./organizations";
import { languageEnum } from "./clients";

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
]);

export const countryContextEnum = pgEnum("country_context", ["DE", "MX", "OTHER"]);

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "restrict" }),
  invoiceNumber: text("invoice_number").notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  currency: currencyEnum("currency").notNull(),
  language: languageEnum("language").notNull(),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  subtotalAmount: numeric("subtotal_amount", { precision: 19, scale: 4 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 19, scale: 4 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 19, scale: 4 }).notNull(),
  notes: text("notes"),
  pdfUrl: text("pdf_url"),
  countryContext: countryContextEnum("country_context").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes are defined in migrations, not here to avoid module evaluation issues

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;


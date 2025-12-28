import { pgTable, uuid, text, timestamp, date, numeric, boolean, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { currencyEnum } from "./organizations";
import { countryContextEnum } from "./invoices";

export const expenseCategoryEnum = pgEnum("expense_category", [
  "rent",
  "software",
  "travel",
  "office",
  "professional_services",
  "utilities",
  "marketing",
  "other",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "card",
  "cash",
  "transfer",
  "other",
]);

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  vendorName: text("vendor_name").notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 19, scale: 4 }).notNull(),
  currency: currencyEnum("currency").notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 19, scale: 4 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 19, scale: 4 }).notNull(),
  category: expenseCategoryEnum("category").notNull(),
  countryContext: countryContextEnum("country_context").notNull(),
  deductible: boolean("deductible").notNull().default(true),
  date: date("date").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  receiptUrl: text("receipt_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes are defined in migrations, not here to avoid module evaluation issues

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;


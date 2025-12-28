import { pgTable, uuid, timestamp, date, numeric, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { countryContextEnum } from "./invoices";

export const periodTypeEnum = pgEnum("period_type", ["monthly", "quarterly", "yearly"]);

export const taxPeriodSummaries = pgTable("tax_period_summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  periodType: periodTypeEnum("period_type").notNull(),
  countryContext: countryContextEnum("country_context").notNull(),
  totalRevenue: numeric("total_revenue", { precision: 19, scale: 4 }).notNull().default("0"),
  totalExpenses: numeric("total_expenses", { precision: 19, scale: 4 }).notNull().default("0"),
  totalTaxCollected: numeric("total_tax_collected", { precision: 19, scale: 4 })
    .notNull()
    .default("0"),
  totalTaxPaid: numeric("total_tax_paid", { precision: 19, scale: 4 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TaxPeriodSummary = typeof taxPeriodSummaries.$inferSelect;
export type NewTaxPeriodSummary = typeof taxPeriodSummaries.$inferInsert;


import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const countryBaseEnum = pgEnum("country_base", ["DE", "MX"]);
export const currencyEnum = pgEnum("currency", ["EUR", "MXN", "USD"]);

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  countryBase: countryBaseEnum("country_base").notNull(),
  defaultCurrency: currencyEnum("default_currency").notNull(),
  taxIdDe: text("tax_id_de"),
  taxIdMx: text("tax_id_mx"),
  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;


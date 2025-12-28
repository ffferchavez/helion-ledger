import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { currencyEnum } from "./organizations";

export const languageEnum = pgEnum("language", ["en", "de", "es"]);

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country"),
  defaultCurrency: currencyEnum("default_currency"),
  defaultLanguage: languageEnum("default_language").default("en"),
  taxId: text("tax_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes are defined in migrations, not here to avoid module evaluation issues

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;


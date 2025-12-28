/**
 * Seed mock data into the database
 * Run with: npx tsx scripts/seed-mock-data.ts
 */

import { db } from "../db";
import {
  organizations,
  users,
  clients,
  invoices,
  invoiceItems,
  expenses,
} from "../db/schema";
import {
  mockOrganization,
  mockUser,
  mockClients,
  mockInvoices,
  mockInvoiceItems,
  mockExpenses,
} from "../lib/mock-data";
import { eq, and } from "drizzle-orm";

async function seedMockData() {
  console.log("🌱 Starting mock data seeding...");

  try {
    // Check if we have a database connection
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Get or create organization
    const existingOrgs = await db
      .select()
      .from(organizations)
      .where(eq(organizations.name, mockOrganization.name))
      .limit(1);
    
    let organization = existingOrgs[0];

    if (!organization) {
      console.log("📝 Creating organization...");
      [organization] = await db.insert(organizations).values(mockOrganization).returning();
      console.log("✅ Organization created:", organization.id);
    } else {
      console.log("✅ Organization already exists:", organization.id);
    }

    // Get current auth user (you'll need to set this)
    const authUserId = process.env.MOCK_AUTH_USER_ID;
    if (!authUserId) {
      console.warn("⚠️  MOCK_AUTH_USER_ID not set. Skipping user creation.");
      console.warn("   Set MOCK_AUTH_USER_ID in .env.local to create a user");
    } else {
      // Check or create user
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.authUserId, authUserId))
        .limit(1);
      
      let user = existingUsers[0];

      if (!user) {
        console.log("📝 Creating user...");
        [user] = await db
          .insert(users)
          .values({
            ...mockUser,
            authUserId,
            organizationId: organization.id,
          })
          .returning();
        console.log("✅ User created:", user.id);
      } else {
        console.log("✅ User already exists:", user.id);
      }
    }

    // Create clients
    console.log("📝 Creating clients...");
    const createdClients: typeof clients.$inferSelect[] = [];
    for (const clientData of mockClients) {
      const existing = await db
        .select()
        .from(clients)
        .where(
          and(
            eq(clients.organizationId, organization.id),
            eq(clients.name, clientData.name)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        const [client] = await db
          .insert(clients)
          .values({
            ...clientData,
            organizationId: organization.id,
          })
          .returning();
        createdClients.push(client);
        console.log(`  ✅ Created client: ${client.name}`);
      } else {
        createdClients.push(existing[0]);
        console.log(`  ⏭️  Client already exists: ${clientData.name}`);
      }
    }

    // Create invoices
    console.log("📝 Creating invoices...");
    for (let i = 0; i < mockInvoices.length; i++) {
      const invoiceData = mockInvoices[i];
      const client = createdClients[i % createdClients.length];
      const invoiceNumber = `INV-${invoiceData.countryContext}-2024-${String(i + 1).padStart(4, "0")}`;

      const existing = await db
        .select()
        .from(invoices)
        .where(eq(invoices.invoiceNumber, invoiceNumber))
        .limit(1);

      if (existing.length === 0) {
        const [invoice] = await db
          .insert(invoices)
          .values({
            ...invoiceData,
            organizationId: organization.id,
            clientId: client.id,
            invoiceNumber,
          })
          .returning();

        // Add invoice items
        await db.insert(invoiceItems).values(
          mockInvoiceItems.map((item) => ({
            ...item,
            invoiceId: invoice.id,
          }))
        );

        console.log(`  ✅ Created invoice: ${invoice.invoiceNumber}`);
      } else {
        console.log(`  ⏭️  Invoice already exists: ${invoiceNumber}`);
      }
    }

    // Create expenses
    console.log("📝 Creating expenses...");
    for (const expenseData of mockExpenses) {
      const existing = await db
        .select()
        .from(expenses)
        .where(
          and(
            eq(expenses.organizationId, organization.id),
            eq(expenses.vendorName, expenseData.vendorName),
            eq(expenses.date, expenseData.date)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        const [expense] = await db
          .insert(expenses)
          .values({
            ...expenseData,
            organizationId: organization.id,
          })
          .returning();
        console.log(`  ✅ Created expense: ${expense.vendorName} - ${expense.date}`);
      } else {
        console.log(`  ⏭️  Expense already exists: ${expenseData.vendorName} - ${expenseData.date}`);
      }
    }

    console.log("🎉 Mock data seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding mock data:", error);
    process.exit(1);
  }
}

seedMockData();


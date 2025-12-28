import { db } from "../index";
import { clients } from "../schema/clients";
import { eq, and, ilike, or } from "drizzle-orm";
import type { NewClient, Client } from "../schema/clients";

/**
 * Get all clients for an organization
 */
export async function getClientsByOrganization(organizationId: string) {
  return db
    .select()
    .from(clients)
    .where(eq(clients.organizationId, organizationId))
    .orderBy(clients.name);
}

/**
 * Get a client by ID (with organization check)
 */
export async function getClientById(clientId: string, organizationId: string) {
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.organizationId, organizationId)))
    .limit(1);

  return client || null;
}

/**
 * Create a new client
 */
export async function createClient(data: NewClient) {
  const [client] = await db.insert(clients).values(data).returning();
  return client;
}

/**
 * Update a client
 */
export async function updateClient(
  clientId: string,
  organizationId: string,
  data: Partial<Omit<Client, "id" | "organizationId" | "createdAt">>
) {
  const [client] = await db
    .update(clients)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(clients.id, clientId), eq(clients.organizationId, organizationId)))
    .returning();

  return client || null;
}

/**
 * Delete a client
 */
export async function deleteClient(clientId: string, organizationId: string) {
  await db
    .delete(clients)
    .where(and(eq(clients.id, clientId), eq(clients.organizationId, organizationId)));
}

/**
 * Search clients by name or email
 */
export async function searchClients(organizationId: string, searchTerm: string) {
  return db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.organizationId, organizationId),
        or(
          ilike(clients.name, `%${searchTerm}%`),
          ilike(clients.email || "", `%${searchTerm}%`)
        )
      )
    )
    .orderBy(clients.name);
}


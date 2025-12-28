"use server";

import { requireOrganizationId } from "@/lib/supabase/auth-helpers";
import { revalidatePath } from "next/cache";
import {
  createClient as createClientQuery,
  getClientById,
  updateClient,
  deleteClient,
} from "@/db/queries/clients";
import { clientSchema, type ClientFormData } from "@/lib/validation/clients";

export async function createClientAction(data: ClientFormData) {
  try {
    const organizationId = await requireOrganizationId();
    const validated = clientSchema.parse(data);

    const newClient = await createClientQuery({
      organizationId,
      name: validated.name,
      contactPerson: validated.contactPerson || null,
      email: validated.email || null,
      phone: validated.phone || null,
      addressLine1: validated.addressLine1 || null,
      addressLine2: validated.addressLine2 || null,
      city: validated.city || null,
      postalCode: validated.postalCode || null,
      country: validated.country || null,
      defaultCurrency: validated.defaultCurrency || null,
      defaultLanguage: validated.defaultLanguage,
      taxId: validated.taxId || null,
    });

    revalidatePath("/invoices");
    return { success: true, data: newClient };
  } catch (error) {
    console.error("Error creating client:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create client",
    };
  }
}

export async function updateClientAction(clientId: string, data: ClientFormData) {
  try {
    const organizationId = await requireOrganizationId();
    const validated = clientSchema.parse(data);

    const updated = await updateClient(clientId, organizationId, {
      name: validated.name,
      contactPerson: validated.contactPerson || null,
      email: validated.email || null,
      phone: validated.phone || null,
      addressLine1: validated.addressLine1 || null,
      addressLine2: validated.addressLine2 || null,
      city: validated.city || null,
      postalCode: validated.postalCode || null,
      country: validated.country || null,
      defaultCurrency: validated.defaultCurrency || null,
      defaultLanguage: validated.defaultLanguage,
      taxId: validated.taxId || null,
    });

    if (!updated) {
      return { success: false, error: "Client not found" };
    }

    revalidatePath("/invoices");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating client:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update client",
    };
  }
}

export async function deleteClientAction(clientId: string) {
  try {
    const organizationId = await requireOrganizationId();
    await deleteClient(clientId, organizationId);
    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    console.error("Error deleting client:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete client",
    };
  }
}


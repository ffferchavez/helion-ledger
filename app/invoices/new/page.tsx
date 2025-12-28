import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { requireOrganizationId } from "@/lib/supabase/auth-helpers";
import { getClientsByOrganization } from "@/db/queries/clients";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { createInvoiceAction } from "../[id]/actions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/lib/env";
import { getMockClients } from "@/lib/mock-data-helpers";

export default async function NewInvoicePage() {
  let clients: Awaited<ReturnType<typeof getClientsByOrganization>>;
  
  if (env.USE_MOCK_DATA || !env.DATABASE_URL) {
    clients = getMockClients() as any;
  } else {
    try {
      const organizationId = await requireOrganizationId();
      clients = await getClientsByOrganization(organizationId);
    } catch (error) {
      console.warn("Auth failed, using mock data:", error);
      clients = getMockClients() as any;
    }
  }

  async function handleSubmit(data: any) {
    "use server";
    const result = await createInvoiceAction(data);
    if (result.success && result.data) {
      redirect(`/invoices/${result.data.id}`);
    }
    return result;
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 animate-in fade-in duration-500">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold tracking-tight">New Invoice</h2>
            <p className="text-sm text-muted-foreground">Create a new invoice</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Fill in the invoice information</CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceForm clients={clients} onSubmit={handleSubmit} />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

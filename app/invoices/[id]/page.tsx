import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { requireOrganizationId } from "@/lib/supabase/auth-helpers";
import { getInvoiceById } from "@/db/queries/invoices";
import { getClientsByOrganization } from "@/db/queries/clients";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { updateInvoiceAction, updateInvoiceStatusAction } from "./actions";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { InvoiceStatusSelect } from "@/components/invoices/invoice-status-select";
import { env } from "@/lib/env";
import { getMockInvoices, getMockClients } from "@/lib/mock-data-helpers";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  let invoice: Awaited<ReturnType<typeof getInvoiceById>>;
  let clients: Awaited<ReturnType<typeof getClientsByOrganization>>;

  if (env.USE_MOCK_DATA || !env.DATABASE_URL) {
    const mockInvoices = getMockInvoices();
    invoice = mockInvoices.find((inv) => inv.id === params.id) || null;
    clients = getMockClients() as any;
  } else {
    try {
      const organizationId = await requireOrganizationId();
      invoice = await getInvoiceById(params.id, organizationId);
      clients = await getClientsByOrganization(organizationId);
    } catch (error) {
      console.warn("Auth failed, using mock data:", error);
      const mockInvoices = getMockInvoices();
      invoice = mockInvoices.find((inv) => inv.id === params.id) || null;
      clients = getMockClients() as any;
    }
  }

  if (!invoice) {
    notFound();
  }

  async function handleSubmit(data: any) {
    "use server";
    return await updateInvoiceAction(params.id, data);
  }

  async function handleStatusChange(status: string) {
    "use server";
    await updateInvoiceStatusAction(params.id, status);
    redirect(`/invoices/${params.id}`);
  }

  const invoiceFormData = {
    clientId: invoice.clientId,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    currency: invoice.currency,
    language: invoice.language,
    countryContext: invoice.countryContext,
    notes: invoice.notes || "",
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      taxRate: parseFloat(item.taxRate),
    })),
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 animate-in fade-in duration-500">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Invoice {invoice.invoiceNumber}
              </h2>
              <p className="text-sm text-muted-foreground">View and edit invoice details</p>
            </div>
            <div className="flex gap-2">
              <InvoiceStatusSelect
                invoiceId={invoice.id}
                currentStatus={invoice.status}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Details</CardTitle>
                  <CardDescription>Edit invoice information</CardDescription>
                </CardHeader>
                <CardContent>
                  <InvoiceForm
                    initialData={invoiceFormData}
                    clients={clients}
                    onSubmit={handleSubmit}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(invoice.subtotalAmount), invoice.currency as any)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(invoice.taxAmount), invoice.currency as any)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="font-bold">Total:</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(parseFloat(invoice.totalAmount), invoice.currency as any)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Issue Date:</span>{" "}
                    <span className="font-medium">{formatDate(invoice.issueDate)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due Date:</span>{" "}
                    <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <span className="font-medium capitalize">{invoice.status}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country:</span>{" "}
                    <span className="font-medium">{invoice.countryContext}</span>
                  </div>
                  {invoice.pdfUrl && (
                    <div className="pt-2">
                      <Button asChild variant="outline" className="w-full">
                        <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                          Download PDF
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

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
import { getServerTranslations } from "@/lib/i18n/server";
import { getCountryLabelKey, getInvoiceStatusLabelKey } from "@/lib/i18n/formatters";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = await getServerTranslations();
  const { id } = await params;
  let invoice: Awaited<ReturnType<typeof getInvoiceById>>;
  let clients: Awaited<ReturnType<typeof getClientsByOrganization>>;

  if (env.USE_MOCK_DATA || !env.DATABASE_URL) {
    const mockInvoices = getMockInvoices();
    invoice = mockInvoices.find((inv) => inv.id === id) || null;
    clients = getMockClients() as any;
  } else {
    try {
      const organizationId = await requireOrganizationId();
      invoice = await getInvoiceById(id, organizationId);
      clients = await getClientsByOrganization(organizationId);
    } catch (error) {
      console.warn("Auth failed, using mock data:", error);
      const mockInvoices = getMockInvoices();
      invoice = mockInvoices.find((inv) => inv.id === id) || null;
      clients = getMockClients() as any;
    }
  }

  if (!invoice) {
    notFound();
  }

  async function handleSubmit(data: any) {
    "use server";
    return await updateInvoiceAction(id, data);
  }

  async function handleStatusChange(status: string) {
    "use server";
    await updateInvoiceStatusAction(id, status);
    redirect(`/invoices/${id}`);
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
                {t("invoices.detail.title", { number: invoice.invoiceNumber })}
              </h2>
              <p className="text-sm text-muted-foreground">{t("invoices.detail.subtitle")}</p>
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
                  <CardTitle>{t("invoices.detail.detailsTitle")}</CardTitle>
                  <CardDescription>{t("invoices.detail.detailsDesc")}</CardDescription>
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
                  <CardTitle>{t("invoices.detail.summaryTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("common.subtotal")}:</span>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(invoice.subtotalAmount), invoice.currency as any)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("common.tax")}:</span>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(invoice.taxAmount), invoice.currency as any)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="font-bold">{t("common.total")}:</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(parseFloat(invoice.totalAmount), invoice.currency as any)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("invoices.detail.infoTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("invoices.detail.issueDate")}:</span>{" "}
                    <span className="font-medium">{formatDate(invoice.issueDate)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("invoices.detail.dueDate")}:</span>{" "}
                    <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("invoices.detail.status")}:</span>{" "}
                    <span className="font-medium">
                      {t(`invoiceStatus.${getInvoiceStatusLabelKey(invoice.status)}`)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("invoices.detail.country")}:</span>{" "}
                    <span className="font-medium">{t(`countries.${getCountryLabelKey(invoice.countryContext)}`)}</span>
                  </div>
                  {invoice.pdfUrl && (
                    <div className="pt-2">
                      <Button asChild variant="outline" className="w-full">
                        <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                          {t("invoices.detail.downloadPdf")}
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

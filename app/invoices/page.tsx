import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { requireOrganizationId } from "@/lib/supabase/auth-helpers";
import { getInvoicesByOrganization } from "@/db/queries/invoices";
import { getClientsByOrganization } from "@/db/queries/clients";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { env } from "@/lib/env";
import { getMockInvoices, getMockClients } from "@/lib/mock-data-helpers";
import { getServerTranslations } from "@/lib/i18n/server";
import { getCountryLabelKey } from "@/lib/i18n/formatters";
import { getInvoiceStatusLabelKey } from "@/lib/i18n/formatters";

export default async function InvoicesPage() {
  const { t } = await getServerTranslations();
  let invoices: Awaited<ReturnType<typeof getInvoicesByOrganization>>;
  let clients: Awaited<ReturnType<typeof getClientsByOrganization>>;

  if (env.USE_MOCK_DATA) {
    invoices = getMockInvoices() as any;
    clients = getMockClients() as any;
  } else {
    try {
      const organizationId = await requireOrganizationId();
      invoices = await getInvoicesByOrganization(organizationId);
      clients = await getClientsByOrganization(organizationId);
    } catch (error) {
      // Fallback to mock data if auth fails
      console.warn("Auth failed, using mock data:", error);
      invoices = getMockInvoices() as any;
      clients = getMockClients() as any;
    }
  }

  const clientsMap = new Map(clients.map((c) => [c.id, c]));

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 animate-in fade-in duration-500">
          {env.USE_MOCK_DATA && (
            <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
              {t("mock.banner")}
            </div>
          )}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">{t("invoices.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("invoices.subtitle")}</p>
            </div>
            <Link href="/invoices/new">
              <Button>{t("invoices.newInvoice")}</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("invoices.cardTitle")}</CardTitle>
              <CardDescription>{t("invoices.cardDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("invoices.table.number")}</TableHead>
                    <TableHead>{t("invoices.table.client")}</TableHead>
                    <TableHead>{t("invoices.table.date")}</TableHead>
                    <TableHead>{t("invoices.table.amount")}</TableHead>
                    <TableHead>{t("invoices.table.status")}</TableHead>
                    <TableHead>{t("invoices.table.country")}</TableHead>
                    <TableHead>{t("invoices.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        {t("invoices.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => {
                      const client = clientsMap.get(invoice.clientId);
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{client?.name || "-"}</TableCell>
                          <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                          <TableCell>
                            {formatCurrency(parseFloat(invoice.totalAmount), invoice.currency as any)}
                          </TableCell>
                          <TableCell>
                            <span>{t(`invoiceStatus.${getInvoiceStatusLabelKey(invoice.status)}`)}</span>
                          </TableCell>
                          <TableCell>{t(`countries.${getCountryLabelKey(invoice.countryContext)}`)}</TableCell>
                          <TableCell>
                            <Link href={`/invoices/${invoice.id}`}>
                              <Button variant="ghost" size="sm">
                                {t("common.view")}
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

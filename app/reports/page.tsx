import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { requireOrganizationId } from "@/lib/supabase/auth-helpers";
import { getFinancialSummary } from "@/db/queries/reports";
import { getCurrentYear, getCurrentMonth, getCurrentQuarter, getPeriodDates } from "@/lib/date";
import { ReportSummary } from "@/components/reports/report-summary";
import { env } from "@/lib/env";
import { getMockFinancialSummary } from "@/lib/mock-data-helpers";
import { Suspense } from "react";
import { getServerTranslations } from "@/lib/i18n/server";

async function ReportsContent({
  searchParams,
}: {
  searchParams: { year?: string; period?: string; country?: string };
}) {
  const year = parseInt(searchParams.year || getCurrentYear().toString(), 10);
  const periodType = (searchParams.period || "monthly") as "monthly" | "quarterly" | "yearly";
  const countryContext = searchParams.country || undefined;
  const { t } = await getServerTranslations();

  let summary: Awaited<ReturnType<typeof getFinancialSummary>>;

  if (env.USE_MOCK_DATA || !env.DATABASE_URL) {
    summary = getMockFinancialSummary();
  } else {
    try {
      const organizationId = await requireOrganizationId();
      let period = periodType === "monthly" ? getCurrentMonth() : periodType === "quarterly" ? getCurrentQuarter() : undefined;
      const { start, end } = getPeriodDates(year, periodType, period);
      summary = await getFinancialSummary(organizationId, start, end, countryContext);
    } catch (error) {
      console.warn("Auth failed, using mock data:", error);
      summary = getMockFinancialSummary();
    }
  }

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
          <div className="mb-6">
            <h2 className="text-3xl font-semibold tracking-tight">{t("reports.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("reports.subtitle")}</p>
          </div>

          <ReportSummary
            summary={summary}
            year={year}
            periodType={periodType}
            countryContext={countryContext}
          />
        </main>
      </div>
    </div>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; period?: string; country?: string }>;
}) {
  const { t } = await getServerTranslations();
  const params = await searchParams;
  
  return (
    <Suspense fallback={<div>{t("misc.loading")}</div>}>
      <ReportsContent searchParams={params} />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currency";
import { COUNTRY_CONTEXT, PERIOD_TYPE } from "@/lib/constants";
import { useI18n } from "@/components/providers/app-providers";

interface ReportSummaryProps {
  summary: {
    revenue: {
      total: number;
      taxCollected: number;
      count: number;
    };
    expenses: {
      total: number;
      taxPaid: number;
      deductible: number;
      count: number;
    };
    net: {
      result: number;
      taxNet: number;
    };
  };
  year: number;
  periodType: "monthly" | "quarterly" | "yearly";
  countryContext?: string;
}

export function ReportSummary({ summary, year, periodType, countryContext }: ReportSummaryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [selectedYear, setSelectedYear] = useState(year || new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState(periodType);
  const [selectedCountry, setSelectedCountry] = useState(countryContext || "all");

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    params.set("year", selectedYear.toString());
    params.set("period", selectedPeriod);
    if (selectedCountry && selectedCountry !== "all") {
      params.set("country", selectedCountry);
    }
    router.push(`/reports?${params.toString()}`);
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    alert(t("reports.exportCsvSoon"));
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert(t("reports.exportPdfSoon"));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("reports.filtersTitle")}</CardTitle>
          <CardDescription>{t("reports.filtersDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="year">{t("reports.year")}</Label>
              <Input
                id="year"
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">{t("reports.periodType")}</Label>
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PERIOD_TYPE.MONTHLY}>{t("reports.monthly")}</SelectItem>
                  <SelectItem value={PERIOD_TYPE.QUARTERLY}>{t("reports.quarterly")}</SelectItem>
                  <SelectItem value={PERIOD_TYPE.YEARLY}>{t("reports.yearly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{t("reports.country")}</Label>
              <Select
                value={selectedCountry}
                onValueChange={(value) => setSelectedCountry(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("reports.allCountries")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("reports.allCountries")}</SelectItem>
                  <SelectItem value={COUNTRY_CONTEXT.DE}>{t("countries.DE")}</SelectItem>
                  <SelectItem value={COUNTRY_CONTEXT.MX}>{t("countries.MX")}</SelectItem>
                  <SelectItem value={COUNTRY_CONTEXT.OTHER}>{t("countries.OTHER")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleFilterChange} className="w-full">
                {t("reports.applyFilters")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        <Card>
          <CardHeader>
            <CardTitle>{t("reports.totalRevenue")}</CardTitle>
            <CardDescription>{t("reports.incomePeriod")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.revenue.total, "EUR")}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {summary.revenue.count} {t("reports.invoicesLabel")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("reports.totalExpenses")}</CardTitle>
            <CardDescription>{t("reports.expensesPeriod")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.expenses.total, "EUR")}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {summary.expenses.count} {t("reports.expensesLabel")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("reports.netResult")}</CardTitle>
            <CardDescription>{t("reports.netDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                summary.net.result >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatCurrency(summary.net.result, "EUR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("reports.taxNet")}</CardTitle>
            <CardDescription>{t("reports.taxNetDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.net.taxNet, "EUR")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("reports.detailedBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">{t("reports.revenue")}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{t("reports.subtotal")}:</span>
                    <span>{formatCurrency(summary.revenue.total - summary.revenue.taxCollected, "EUR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("reports.taxCollected")}:</span>
                    <span>{formatCurrency(summary.revenue.taxCollected, "EUR")}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-border pt-1">
                    <span>{t("reports.total")}:</span>
                    <span>{formatCurrency(summary.revenue.total, "EUR")}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t("reports.expenses")}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{t("reports.subtotal")}:</span>
                    <span>{formatCurrency(summary.expenses.total - summary.expenses.taxPaid, "EUR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("reports.taxPaid")}:</span>
                    <span>{formatCurrency(summary.expenses.taxPaid, "EUR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("reports.deductible")}:</span>
                    <span>{formatCurrency(summary.expenses.deductible, "EUR")}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-border pt-1">
                    <span>{t("reports.total")}:</span>
                    <span>{formatCurrency(summary.expenses.total, "EUR")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleExportCSV} variant="outline">
          {t("reports.exportCsv")}
        </Button>
        <Button onClick={handleExportPDF} variant="outline">
          {t("reports.generatePdf")}
        </Button>
      </div>
    </div>
  );
}

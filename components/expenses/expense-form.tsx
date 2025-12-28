"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, type ExpenseFormData } from "@/lib/validation/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CURRENCY,
  COUNTRY_CONTEXT,
  EXPENSE_CATEGORY,
  PAYMENT_METHOD,
} from "@/lib/constants";
import { calculateTax, calculateTotal, formatCurrency } from "@/lib/currency";
import { useI18n } from "@/components/providers/app-providers";

interface ExpenseFormProps {
  initialData?: ExpenseFormData;
  onSubmit: (data: ExpenseFormData) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: ExpenseFormProps) {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: initialData || {
      deductible: true,
      taxRate: 19,
    },
  });

  const amount = watch("amount");
  const taxRate = watch("taxRate");
  const currency = watch("currency");

  const taxAmount = amount ? calculateTax(amount, taxRate) : 0;
  const totalAmount = amount ? calculateTotal(amount, taxAmount) : 0;

  const handleFormSubmit = async (data: ExpenseFormData) => {
    const result = await onSubmit(data);
    if (!result.success && result.error) {
      alert(t(result.error));
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vendorName">
            {t("expenses.form.vendorName")} *
          </Label>
          <Input id="vendorName" {...register("vendorName")} />
          {errors.vendorName?.message && (
            <p className="text-sm text-destructive">{t(errors.vendorName.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">
            {t("expenses.form.date")} *
          </Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date?.message && (
            <p className="text-sm text-destructive">{t(errors.date.message)}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("expenses.form.description")}</Label>
        <Textarea id="description" {...register("description")} rows={3} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="amount">
            {t("expenses.form.amount")} *
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount?.message && (
            <p className="text-sm text-destructive">{t(errors.amount.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">
            {t("expenses.form.currency")} *
          </Label>
          <Select
            value={currency || CURRENCY.EUR}
            onValueChange={(value) => setValue("currency", value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CURRENCY.EUR}>EUR</SelectItem>
              <SelectItem value={CURRENCY.MXN}>MXN</SelectItem>
              <SelectItem value={CURRENCY.USD}>USD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxRate">
            {t("expenses.form.taxRate")} *
          </Label>
          <Input
            id="taxRate"
            type="number"
            step="0.01"
            {...register("taxRate", { valueAsNumber: true })}
          />
          {errors.taxRate?.message && (
            <p className="text-sm text-destructive">{t(errors.taxRate.message)}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">
            {t("expenses.form.category")} *
          </Label>
          <Select
            value={watch("category") || ""}
            onValueChange={(value) => setValue("category", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("expenses.form.selectCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EXPENSE_CATEGORY.RENT}>{t("expenseCategories.rent")}</SelectItem>
              <SelectItem value={EXPENSE_CATEGORY.SOFTWARE}>{t("expenseCategories.software")}</SelectItem>
              <SelectItem value={EXPENSE_CATEGORY.TRAVEL}>{t("expenseCategories.travel")}</SelectItem>
              <SelectItem value={EXPENSE_CATEGORY.OFFICE}>{t("expenseCategories.office")}</SelectItem>
              <SelectItem value={EXPENSE_CATEGORY.PROFESSIONAL_SERVICES}>
                {t("expenseCategories.professionalServices")}
              </SelectItem>
              <SelectItem value={EXPENSE_CATEGORY.UTILITIES}>{t("expenseCategories.utilities")}</SelectItem>
              <SelectItem value={EXPENSE_CATEGORY.MARKETING}>{t("expenseCategories.marketing")}</SelectItem>
              <SelectItem value={EXPENSE_CATEGORY.OTHER}>{t("expenseCategories.other")}</SelectItem>
            </SelectContent>
          </Select>
          {errors.category?.message && (
            <p className="text-sm text-destructive">{t(errors.category.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">
            {t("expenses.form.paymentMethod")} *
          </Label>
          <Select
            value={watch("paymentMethod") || ""}
            onValueChange={(value) => setValue("paymentMethod", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("expenses.form.selectMethod")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PAYMENT_METHOD.CARD}>{t("paymentMethods.card")}</SelectItem>
              <SelectItem value={PAYMENT_METHOD.CASH}>{t("paymentMethods.cash")}</SelectItem>
              <SelectItem value={PAYMENT_METHOD.TRANSFER}>{t("paymentMethods.transfer")}</SelectItem>
              <SelectItem value={PAYMENT_METHOD.OTHER}>{t("paymentMethods.other")}</SelectItem>
            </SelectContent>
          </Select>
          {errors.paymentMethod?.message && (
            <p className="text-sm text-destructive">{t(errors.paymentMethod.message)}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="countryContext">
            {t("expenses.form.countryContext")} *
          </Label>
          <Select
            value={watch("countryContext") || COUNTRY_CONTEXT.DE}
            onValueChange={(value) => setValue("countryContext", value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={COUNTRY_CONTEXT.DE}>{t("countries.DE")}</SelectItem>
              <SelectItem value={COUNTRY_CONTEXT.MX}>{t("countries.MX")}</SelectItem>
              <SelectItem value={COUNTRY_CONTEXT.OTHER}>{t("countries.OTHER")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 pt-2 md:pt-8">
          <Checkbox
            id="deductible"
            checked={watch("deductible")}
            onCheckedChange={(checked) => setValue("deductible", checked === true)}
          />
          <Label htmlFor="deductible" className="cursor-pointer">
            {t("expenses.form.deductible")}
          </Label>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex justify-end space-x-4 text-right">
          <div>
            <div className="text-sm text-muted-foreground">{t("common.amount")}:</div>
            <div className="text-lg font-semibold">
              {amount ? formatCurrency(amount, currency as any) : formatCurrency(0, currency as any)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t("common.tax")}:</div>
            <div className="text-lg font-semibold">
              {formatCurrency(taxAmount, currency as any)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t("common.total")}:</div>
            <div className="text-xl font-bold">
              {formatCurrency(totalAmount, currency as any)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t("common.saving") : t("expenses.form.save")}
        </Button>
      </div>
    </form>
  );
}

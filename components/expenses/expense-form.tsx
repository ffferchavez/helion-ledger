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
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vendorName">Vendor Name *</Label>
          <Input id="vendorName" {...register("vendorName")} />
          {errors.vendorName && (
            <p className="text-sm text-destructive">{errors.vendorName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} rows={3} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
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
          <Label htmlFor="taxRate">Tax Rate (%) *</Label>
          <Input
            id="taxRate"
            type="number"
            step="0.01"
            {...register("taxRate", { valueAsNumber: true })}
          />
          {errors.taxRate && <p className="text-sm text-destructive">{errors.taxRate.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={watch("category") || ""}
            onValueChange={(value) => setValue("category", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EXPENSE_CATEGORY.RENT}>Rent</SelectItem>
              <SelectItem value={EXPENSE_CATEGORY.SOFTWARE}>Software</SelectItem>
              <SelectItem value={EXPENSE_CATEGORY.TRAVEL}>Travel</SelectItem>
              <SelectItem value={EXPENSE_CATEGORY.OFFICE}>Office</SelectItem>
              <SelectItem value={EXPENSE_CATEGORY.PROFESSIONAL_SERVICES}>
                Professional Services
              </SelectItem>
              <SelectItem value={EXPENSE_CATEGORY.UTILITIES}>Utilities</SelectItem>
              <SelectItem value={EXPENSE_CATEGORY.MARKETING}>Marketing</SelectItem>
              <SelectItem value={EXPENSE_CATEGORY.OTHER}>Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment Method *</Label>
          <Select
            value={watch("paymentMethod") || ""}
            onValueChange={(value) => setValue("paymentMethod", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PAYMENT_METHOD.CARD}>Card</SelectItem>
              <SelectItem value={PAYMENT_METHOD.CASH}>Cash</SelectItem>
              <SelectItem value={PAYMENT_METHOD.TRANSFER}>Transfer</SelectItem>
              <SelectItem value={PAYMENT_METHOD.OTHER}>Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.paymentMethod && (
            <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="countryContext">Country Context *</Label>
          <Select
            value={watch("countryContext") || COUNTRY_CONTEXT.DE}
            onValueChange={(value) => setValue("countryContext", value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={COUNTRY_CONTEXT.DE}>Germany (DE)</SelectItem>
              <SelectItem value={COUNTRY_CONTEXT.MX}>Mexico (MX)</SelectItem>
              <SelectItem value={COUNTRY_CONTEXT.OTHER}>Other</SelectItem>
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
            Tax deductible
          </Label>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex justify-end space-x-4 text-right">
          <div>
            <div className="text-sm text-muted-foreground">Amount:</div>
            <div className="text-lg font-semibold">
              {amount ? formatCurrency(amount, currency as any) : formatCurrency(0, currency as any)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Tax:</div>
            <div className="text-lg font-semibold">
              {formatCurrency(taxAmount, currency as any)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total:</div>
            <div className="text-xl font-bold">
              {formatCurrency(totalAmount, currency as any)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Expense"}
        </Button>
      </div>
    </form>
  );
}

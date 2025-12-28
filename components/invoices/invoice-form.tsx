"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceFormData, type InvoiceItemFormData } from "@/lib/validation/invoices";
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
import { CURRENCY, LANGUAGE, COUNTRY_CONTEXT } from "@/lib/constants";
import { calculateTax, calculateTotal, formatCurrency } from "@/lib/currency";
import { Plus, Trash2 } from "lucide-react";

interface InvoiceFormProps {
  initialData?: InvoiceFormData;
  clients: Array<{ id: string; name: string }>;
  onSubmit: (data: InvoiceFormData) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function InvoiceForm({ initialData, clients, onSubmit, onCancel, isLoading }: InvoiceFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: initialData || {
      items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 19 }],
      currency: CURRENCY.EUR,
      language: LANGUAGE.EN,
      countryContext: COUNTRY_CONTEXT.DE,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const currency = watch("currency");
  const items = watch("items");

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxTotal = items.reduce(
    (sum, item) => sum + calculateTax(item.quantity * item.unitPrice, item.taxRate),
    0
  );
  const total = calculateTotal(subtotal, taxTotal);

  const handleFormSubmit = async (data: InvoiceFormData) => {
    const result = await onSubmit(data);
    if (!result.success && result.error) {
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clientId">Client *</Label>
          <Select
            value={watch("clientId") || ""}
            onValueChange={(value) => setValue("clientId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.clientId && (
            <p className="text-sm text-destructive">{errors.clientId.message}</p>
          )}
        </div>

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
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="issueDate">Issue Date *</Label>
          <Input id="issueDate" type="date" {...register("issueDate")} />
          {errors.issueDate && (
            <p className="text-sm text-destructive">{errors.issueDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input id="dueDate" type="date" {...register("dueDate")} />
          {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <Select value={currency || CURRENCY.EUR} onValueChange={(value) => setValue("currency", value as any)}>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Language *</Label>
        <Select
          value={watch("language") || LANGUAGE.EN}
          onValueChange={(value) => setValue("language", value as any)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LANGUAGE.EN}>English</SelectItem>
            <SelectItem value={LANGUAGE.DE}>Deutsch</SelectItem>
            <SelectItem value={LANGUAGE.ES}>Español</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Line Items *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: "", quantity: 1, unitPrice: 0, taxRate: 19 })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex gap-2 items-start rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex-1 grid grid-cols-1 gap-2 md:grid-cols-12">
                <div className="md:col-span-5">
                  <Input
                    placeholder="Description"
                    {...register(`items.${index}.description`)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Quantity"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Unit Price"
                    {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Tax %"
                    {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
                  />
                </div>
                <div className="md:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.items && <p className="text-sm text-destructive">{errors.items.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} rows={3} />
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex justify-end space-x-4 text-right">
          <div>
            <div className="text-sm text-muted-foreground">Subtotal:</div>
            <div className="text-lg font-semibold">{formatCurrency(subtotal, currency as any)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Tax:</div>
            <div className="text-lg font-semibold">{formatCurrency(taxTotal, currency as any)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total:</div>
            <div className="text-xl font-bold">{formatCurrency(total, currency as any)}</div>
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
          {isLoading ? "Saving..." : "Save Invoice"}
        </Button>
      </div>
    </form>
  );
}

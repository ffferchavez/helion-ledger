import { z } from "zod";
import { CURRENCY, LANGUAGE, COUNTRY_CONTEXT, INVOICE_STATUS } from "../constants";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unitPrice: z.coerce.number().nonnegative("Unit price must be non-negative"),
  taxRate: z.coerce.number().min(0).max(100, "Tax rate must be between 0 and 100"),
});

export const invoiceSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  currency: z.enum([CURRENCY.EUR, CURRENCY.MXN, CURRENCY.USD]),
  language: z.enum([LANGUAGE.EN, LANGUAGE.DE, LANGUAGE.ES]),
  countryContext: z.enum([COUNTRY_CONTEXT.DE, COUNTRY_CONTEXT.MX, COUNTRY_CONTEXT.OTHER]),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;


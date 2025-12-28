import { z } from "zod";
import { CURRENCY, LANGUAGE, COUNTRY_CONTEXT, INVOICE_STATUS } from "../constants";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "validation.descriptionRequired"),
  quantity: z.coerce.number().positive("validation.quantityPositive"),
  unitPrice: z.coerce.number().nonnegative("validation.unitPriceNonNegative"),
  taxRate: z.coerce.number().min(0).max(100, "validation.taxRateRange"),
});

export const invoiceSchema = z.object({
  clientId: z.string().uuid("validation.clientIdInvalid"),
  issueDate: z.string().min(1, "validation.issueDateRequired"),
  dueDate: z.string().min(1, "validation.dueDateRequired"),
  currency: z.enum([CURRENCY.EUR, CURRENCY.MXN, CURRENCY.USD]),
  language: z.enum([LANGUAGE.EN, LANGUAGE.DE, LANGUAGE.ES]),
  countryContext: z.enum([COUNTRY_CONTEXT.DE, COUNTRY_CONTEXT.MX, COUNTRY_CONTEXT.OTHER]),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "validation.itemsRequired"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;

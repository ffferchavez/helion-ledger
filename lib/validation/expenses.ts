import { z } from "zod";
import {
  CURRENCY,
  COUNTRY_CONTEXT,
  EXPENSE_CATEGORY,
  PAYMENT_METHOD,
} from "../constants";

export const expenseSchema = z.object({
  vendorName: z.string().min(1, "validation.vendorNameRequired"),
  description: z.string().optional(),
  amount: z.number().positive("validation.amountPositive"),
  currency: z.enum([CURRENCY.EUR, CURRENCY.MXN, CURRENCY.USD]),
  taxRate: z.number().min(0).max(100, "validation.taxRateRange"),
  category: z.enum(
    [
      EXPENSE_CATEGORY.RENT,
      EXPENSE_CATEGORY.SOFTWARE,
      EXPENSE_CATEGORY.TRAVEL,
      EXPENSE_CATEGORY.OFFICE,
      EXPENSE_CATEGORY.PROFESSIONAL_SERVICES,
      EXPENSE_CATEGORY.UTILITIES,
      EXPENSE_CATEGORY.MARKETING,
      EXPENSE_CATEGORY.OTHER,
    ],
    {
      message: "validation.required",
    }
  ),
  countryContext: z.enum([COUNTRY_CONTEXT.DE, COUNTRY_CONTEXT.MX, COUNTRY_CONTEXT.OTHER]),
  deductible: z.boolean().optional().default(true),
  date: z.string().min(1, "validation.dateRequired"),
  paymentMethod: z.enum(
    [
      PAYMENT_METHOD.CARD,
      PAYMENT_METHOD.CASH,
      PAYMENT_METHOD.TRANSFER,
      PAYMENT_METHOD.OTHER,
    ],
    {
      message: "validation.required",
    }
  ),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

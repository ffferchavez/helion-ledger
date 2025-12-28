import { z } from "zod";
import {
  CURRENCY,
  COUNTRY_CONTEXT,
  EXPENSE_CATEGORY,
  PAYMENT_METHOD,
} from "../constants";

export const expenseSchema = z.object({
  vendorName: z.string().min(1, "Vendor name is required"),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum([CURRENCY.EUR, CURRENCY.MXN, CURRENCY.USD]),
  taxRate: z.number().min(0).max(100, "Tax rate must be between 0 and 100"),
  category: z.enum([
    EXPENSE_CATEGORY.RENT,
    EXPENSE_CATEGORY.SOFTWARE,
    EXPENSE_CATEGORY.TRAVEL,
    EXPENSE_CATEGORY.OFFICE,
    EXPENSE_CATEGORY.PROFESSIONAL_SERVICES,
    EXPENSE_CATEGORY.UTILITIES,
    EXPENSE_CATEGORY.MARKETING,
    EXPENSE_CATEGORY.OTHER,
  ]),
  countryContext: z.enum([COUNTRY_CONTEXT.DE, COUNTRY_CONTEXT.MX, COUNTRY_CONTEXT.OTHER]),
  deductible: z.boolean().optional().default(true),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.enum([
    PAYMENT_METHOD.CARD,
    PAYMENT_METHOD.CASH,
    PAYMENT_METHOD.TRANSFER,
    PAYMENT_METHOD.OTHER,
  ]),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;


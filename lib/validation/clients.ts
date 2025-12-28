import { z } from "zod";
import { CURRENCY, LANGUAGE } from "../constants";

export const clientSchema = z.object({
  name: z.string().min(1, "validation.nameRequired"),
  contactPerson: z.string().optional(),
  email: z.string().email("validation.invalidEmail").optional().or(z.literal("")),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  defaultCurrency: z.enum([CURRENCY.EUR, CURRENCY.MXN, CURRENCY.USD]).optional(),
  defaultLanguage: z.enum([LANGUAGE.EN, LANGUAGE.DE, LANGUAGE.ES]).default(LANGUAGE.EN),
  taxId: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

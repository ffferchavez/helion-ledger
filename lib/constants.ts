// Enums and constants for Helion Ledger

export const COUNTRY_BASE = {
  DE: "DE",
  MX: "MX",
} as const;

export type CountryBase = (typeof COUNTRY_BASE)[keyof typeof COUNTRY_BASE];

export const CURRENCY = {
  EUR: "EUR",
  MXN: "MXN",
  USD: "USD",
} as const;

export type Currency = (typeof CURRENCY)[keyof typeof CURRENCY];

export const LANGUAGE = {
  EN: "en",
  DE: "de",
  ES: "es",
} as const;

export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE];

export const INVOICE_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
} as const;

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

export const COUNTRY_CONTEXT = {
  DE: "DE",
  MX: "MX",
  OTHER: "OTHER",
} as const;

export type CountryContext = (typeof COUNTRY_CONTEXT)[keyof typeof COUNTRY_CONTEXT];

export const EXPENSE_CATEGORY = {
  RENT: "rent",
  SOFTWARE: "software",
  TRAVEL: "travel",
  OFFICE: "office",
  PROFESSIONAL_SERVICES: "professional_services",
  UTILITIES: "utilities",
  MARKETING: "marketing",
  OTHER: "other",
} as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORY)[keyof typeof EXPENSE_CATEGORY];

export const PAYMENT_METHOD = {
  CARD: "card",
  CASH: "cash",
  TRANSFER: "transfer",
  OTHER: "other",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const USER_ROLE = {
  OWNER: "owner",
  USER: "user",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const PERIOD_TYPE = {
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  YEARLY: "yearly",
} as const;

export type PeriodType = (typeof PERIOD_TYPE)[keyof typeof PERIOD_TYPE];

// Tax rates (common rates for DE and MX)
export const TAX_RATES = {
  DE_STANDARD: 19.0,
  DE_REDUCED: 7.0,
  MX_STANDARD: 16.0,
  MX_ZERO: 0.0,
} as const;

// Currency formatting
export const CURRENCY_FORMAT: Record<Currency, Intl.NumberFormatOptions> = {
  EUR: {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  MXN: {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  USD: {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
};


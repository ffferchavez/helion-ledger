import {
  COUNTRY_CONTEXT,
  EXPENSE_CATEGORY,
  INVOICE_STATUS,
  PAYMENT_METHOD,
  type CountryContext,
  type ExpenseCategory,
  type InvoiceStatus,
  type PaymentMethod,
} from "@/lib/constants";

export function getCountryLabelKey(value: CountryContext | string) {
  if (value === COUNTRY_CONTEXT.DE || value === COUNTRY_CONTEXT.MX || value === COUNTRY_CONTEXT.OTHER) {
    return value;
  }
  return COUNTRY_CONTEXT.OTHER;
}

export function getExpenseCategoryLabelKey(value: ExpenseCategory | string) {
  switch (value) {
    case EXPENSE_CATEGORY.RENT:
      return "rent";
    case EXPENSE_CATEGORY.SOFTWARE:
      return "software";
    case EXPENSE_CATEGORY.TRAVEL:
      return "travel";
    case EXPENSE_CATEGORY.OFFICE:
      return "office";
    case EXPENSE_CATEGORY.PROFESSIONAL_SERVICES:
      return "professionalServices";
    case EXPENSE_CATEGORY.UTILITIES:
      return "utilities";
    case EXPENSE_CATEGORY.MARKETING:
      return "marketing";
    case EXPENSE_CATEGORY.OTHER:
      return "other";
    default:
      return "other";
  }
}

export function getPaymentMethodLabelKey(value: PaymentMethod | string) {
  switch (value) {
    case PAYMENT_METHOD.CARD:
      return "card";
    case PAYMENT_METHOD.CASH:
      return "cash";
    case PAYMENT_METHOD.TRANSFER:
      return "transfer";
    case PAYMENT_METHOD.OTHER:
      return "other";
    default:
      return "other";
  }
}

export function getInvoiceStatusLabelKey(value: InvoiceStatus | string) {
  switch (value) {
    case INVOICE_STATUS.DRAFT:
      return "draft";
    case INVOICE_STATUS.SENT:
      return "sent";
    case INVOICE_STATUS.PAID:
      return "paid";
    case INVOICE_STATUS.OVERDUE:
      return "overdue";
    case INVOICE_STATUS.CANCELLED:
      return "cancelled";
    default:
      return "draft";
  }
}

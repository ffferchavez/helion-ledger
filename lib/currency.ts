import { CURRENCY_FORMAT, type Currency } from "./constants";

/**
 * Format a number as currency based on the currency type
 */
export function formatCurrency(amount: number | string, currency: Currency): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(undefined, CURRENCY_FORMAT[currency]).format(numAmount);
}

/**
 * Parse a currency string to a number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and spaces, replace comma with dot
  const cleaned = value.replace(/[^\d.,-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/**
 * Calculate tax amount from subtotal and tax rate
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * (taxRate / 100);
}

/**
 * Calculate total from subtotal and tax amount
 */
export function calculateTotal(subtotal: number, taxAmount: number): number {
  return subtotal + taxAmount;
}


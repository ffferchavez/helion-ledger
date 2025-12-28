import { format, parse, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";

/**
 * Format date for display
 */
export function formatDate(date: Date | string, formatStr: string = "yyyy-MM-dd"): string {
  const dateObj = typeof date === "string" ? parse(date, "yyyy-MM-dd", new Date()) : date;
  return format(dateObj, formatStr);
}

/**
 * Get start and end dates for a period
 */
export function getPeriodDates(
  year: number,
  periodType: "monthly" | "quarterly" | "yearly",
  period?: number
): { start: Date; end: Date } {
  let start: Date;
  let end: Date;

  if (periodType === "yearly") {
    start = startOfYear(new Date(year, 0, 1));
    end = endOfYear(new Date(year, 0, 1));
  } else if (periodType === "quarterly") {
    if (period === undefined || period < 1 || period > 4) {
      throw new Error("Quarter must be between 1 and 4");
    }
    const quarterStartMonth = (period - 1) * 3;
    start = startOfQuarter(new Date(year, quarterStartMonth, 1));
    end = endOfQuarter(new Date(year, quarterStartMonth, 1));
  } else {
    // monthly
    if (period === undefined || period < 1 || period > 12) {
      throw new Error("Month must be between 1 and 12");
    }
    start = startOfMonth(new Date(year, period - 1, 1));
    end = endOfMonth(new Date(year, period - 1, 1));
  }

  return { start, end };
}

/**
 * Get current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Get current month (1-12)
 */
export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

/**
 * Get current quarter (1-4)
 */
export function getCurrentQuarter(): number {
  return Math.floor(new Date().getMonth() / 3) + 1;
}


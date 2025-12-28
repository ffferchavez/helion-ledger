"use server";

import { requireOrganizationId } from "@/lib/supabase/auth-helpers";
import { revalidatePath } from "next/cache";
import {
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "@/db/queries/expenses";
import { expenseSchema, type ExpenseFormData } from "@/lib/validation/expenses";
import { calculateTax, calculateTotal } from "@/lib/currency";

export async function createExpenseAction(data: ExpenseFormData) {
  try {
    const organizationId = await requireOrganizationId();
    const validated = expenseSchema.parse(data);

    const taxAmount = calculateTax(validated.amount, validated.taxRate);
    const totalAmount = calculateTotal(validated.amount, taxAmount);

    const newExpense = await createExpense({
      organizationId,
      vendorName: validated.vendorName,
      description: validated.description || null,
      amount: validated.amount.toString(),
      currency: validated.currency,
      taxRate: validated.taxRate.toString(),
      taxAmount: taxAmount.toString(),
      totalAmount: totalAmount.toString(),
      category: validated.category,
      countryContext: validated.countryContext,
      deductible: validated.deductible,
      date: validated.date,
      paymentMethod: validated.paymentMethod,
      receiptUrl: null,
    });

    revalidatePath("/expenses");
    return { success: true, data: newExpense };
  } catch (error) {
    console.error("Error creating expense:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create expense",
    };
  }
}

export async function updateExpenseAction(expenseId: string, data: ExpenseFormData) {
  try {
    const organizationId = await requireOrganizationId();
    const validated = expenseSchema.parse(data);

    const taxAmount = calculateTax(validated.amount, validated.taxRate);
    const totalAmount = calculateTotal(validated.amount, taxAmount);

    const updated = await updateExpense(expenseId, organizationId, {
      vendorName: validated.vendorName,
      description: validated.description || null,
      amount: validated.amount.toString(),
      currency: validated.currency,
      taxRate: validated.taxRate.toString(),
      taxAmount: taxAmount.toString(),
      totalAmount: totalAmount.toString(),
      category: validated.category,
      countryContext: validated.countryContext,
      deductible: validated.deductible,
      date: validated.date,
      paymentMethod: validated.paymentMethod,
    });

    if (!updated) {
      return { success: false, error: "Expense not found" };
    }

    revalidatePath("/expenses");
    revalidatePath(`/expenses/${expenseId}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating expense:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update expense",
    };
  }
}

export async function deleteExpenseAction(expenseId: string) {
  try {
    const organizationId = await requireOrganizationId();
    await deleteExpense(expenseId, organizationId);
    revalidatePath("/expenses");
    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete expense",
    };
  }
}


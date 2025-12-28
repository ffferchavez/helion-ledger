"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVOICE_STATUS } from "@/lib/constants";

interface InvoiceStatusSelectProps {
  invoiceId: string;
  currentStatus: string;
  onStatusChange: (status: string) => Promise<void>;
}

export function InvoiceStatusSelect({
  invoiceId,
  currentStatus,
  onStatusChange,
}: InvoiceStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (value: string) => {
    startTransition(async () => {
      await onStatusChange(value);
      router.refresh();
    });
  };

  return (
    <Select value={currentStatus} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={INVOICE_STATUS.DRAFT}>Draft</SelectItem>
        <SelectItem value={INVOICE_STATUS.SENT}>Sent</SelectItem>
        <SelectItem value={INVOICE_STATUS.PAID}>Paid</SelectItem>
        <SelectItem value={INVOICE_STATUS.OVERDUE}>Overdue</SelectItem>
        <SelectItem value={INVOICE_STATUS.CANCELLED}>Cancelled</SelectItem>
      </SelectContent>
    </Select>
  );
}

